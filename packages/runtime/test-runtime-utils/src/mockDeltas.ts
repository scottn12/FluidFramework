/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { EventEmitter, TypedEventEmitter } from "@fluid-internal/client-utils";
import {
	IDeltaManager,
	IDeltaManagerEvents,
	IDeltaQueue,
	ReadOnlyInfo,
} from "@fluidframework/container-definitions/internal";
import { assert } from "@fluidframework/core-utils/internal";
import { IClientDetails } from "@fluidframework/driver-definitions";
import {
	IClientConfiguration,
	IDocumentMessage,
	MessageType,
	ISequencedDocumentMessage,
	ISignalMessage,
} from "@fluidframework/driver-definitions/internal";

/**
 * Mock implementation of IDeltaQueue for testing that does nothing
 * @legacy
 * @alpha
 */
export class MockDeltaQueue<T> extends EventEmitter implements IDeltaQueue<T> {
	protected readonly queue: T[] = [];
	protected pauseCount = 0;

	public processCallback: (el: T) => void = () => {};

	public get disposed(): any {
		return undefined;
	}

	public get paused(): boolean {
		return this.pauseCount !== 0;
	}

	public get length() {
		return this.queue.length;
	}

	public get idle(): boolean {
		return this.queue.length === 0;
	}

	protected process() {
		void Promise.resolve().then(() => {
			while (this.pauseCount === 0 && this.length > 0) {
				const el = this.pop();
				assert(el !== undefined, "this is impossible due to the above length check");
				this.processCallback(el);
			}
		});
	}

	public push(el: T) {
		this.queue.push(el);
		this.emit("push", el);
		this.process();
	}

	public pop() {
		return this.queue.shift();
	}

	public async pause(): Promise<void> {
		this.pauseCount++;
		return;
	}

	public resume(): void {
		this.pauseCount--;
		this.process();
	}

	public peek(): T | undefined {
		return this.queue[0];
	}

	public toArray(): T[] {
		return this.queue;
	}

	public dispose() {}

	public async waitTillProcessingDone(): Promise<{ count: number; duration: number }> {
		throw new Error("NYI");
	}

	constructor() {
		super();
	}
}

/**
 * Mock implementation of IDeltaManager for testing that creates mock DeltaQueues for testing
 * @legacy
 * @alpha
 */
export class MockDeltaManager
	extends TypedEventEmitter<IDeltaManagerEvents>
	implements IDeltaManager<ISequencedDocumentMessage, IDocumentMessage>
{
	public get disposed(): any {
		return undefined;
	}

	public readOnlyInfo: ReadOnlyInfo = { readonly: false };
	public readonly clientType: string = undefined as any;
	public readonly clientDetails: IClientDetails = {} as any;
	public get IDeltaSender() {
		return this;
	}

	private readonly _inbound: MockDeltaQueue<ISequencedDocumentMessage> = undefined as any;
	private readonly _inboundSignal: MockDeltaQueue<ISignalMessage> = undefined as any;
	private readonly _outbound: MockDeltaQueue<IDocumentMessage[]> = undefined as any;

	public get inbound(): MockDeltaQueue<ISequencedDocumentMessage> {
		return this._inbound;
	}

	public get outbound(): MockDeltaQueue<IDocumentMessage[]> {
		return this._outbound;
	}

	public get inboundSignal(): MockDeltaQueue<ISignalMessage> {
		return this._inboundSignal;
	}
	public minimumSequenceNumber = 0;

	public lastSequenceNumber = 0;
	public lastMessage: ISequencedDocumentMessage | undefined;

	readonly lastKnownSeqNumber = 0;

	public initialSequenceNumber = 0;
	public hasCheckpointSequenceNumber = false;

	public get version(): string {
		return undefined as any as string;
	}

	public readonly maxMessageSize: number = 0;

	public get serviceConfiguration(): IClientConfiguration {
		return undefined as any as IClientConfiguration;
	}

	public active: boolean = true;

	public close(): void {}

	public submitSignal(content: any): void {}

	public flush() {}

	public submit(
		type: MessageType,
		contents: any,
		batch = false,
		localOpMetadata: any,
	): number {
		return 0;
	}

	public dispose() {
		this.removeAllListeners();
	}

	public clientSequenceNumber = 0;

	public process(message: ISequencedDocumentMessage): void {
		assert(message.sequenceNumber !== undefined, "message missing sequenceNumber");
		assert(
			message.minimumSequenceNumber !== undefined,
			"message missing minimumSequenceNumber",
		);
		this.lastSequenceNumber = message.sequenceNumber;
		this.lastMessage = message;
		this.minimumSequenceNumber = message.minimumSequenceNumber;
		this.emit("op", message);
	}

	constructor(private readonly getClientId?: () => string | undefined) {
		super();

		this._inbound = new MockDeltaQueue<ISequencedDocumentMessage>();

		this._outbound = new MockDeltaQueue<IDocumentMessage[]>();
		this._outbound.on("push", (messages: IDocumentMessage[]) => {
			messages.forEach((message: IDocumentMessage) => {
				// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
				this._inbound.push({
					...message,
					clientId: this.getClientId?.() ?? null,
					// ! sequenceNumber and minimumSequenceNumber should be added by MockContainerRuntimeFactory
				} as ISequencedDocumentMessage);
			});
		});
		this._inboundSignal = new MockDeltaQueue<ISignalMessage>();
	}
}
