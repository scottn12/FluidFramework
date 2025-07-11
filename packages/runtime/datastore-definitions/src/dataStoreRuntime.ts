/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { AttachState, IAudience } from "@fluidframework/container-definitions";
import type {
	IFluidHandle,
	FluidObject,
	IDisposable,
	IEvent,
	IEventProvider,
	ITelemetryBaseLogger,
	ErasedType,
} from "@fluidframework/core-interfaces";
import type { IFluidHandleContext } from "@fluidframework/core-interfaces/internal";
import type { IQuorumClients } from "@fluidframework/driver-definitions";
import type { ISequencedDocumentMessage } from "@fluidframework/driver-definitions/internal";
import type { IIdCompressor } from "@fluidframework/id-compressor";
import type { IInboundSignalMessage } from "@fluidframework/runtime-definitions/internal";

import type { IChannel } from "./channel.js";

/**
 * Events emitted by {@link IFluidDataStoreRuntime}.
 * @legacy
 * @alpha
 */
export interface IFluidDataStoreRuntimeEvents extends IEvent {
	(event: "disconnected", listener: () => void);
	(event: "dispose", listener: () => void);
	(event: "attaching", listener: () => void);
	(event: "attached", listener: () => void);
	(event: "op", listener: (message: ISequencedDocumentMessage) => void);
	(event: "signal", listener: (message: IInboundSignalMessage, local: boolean) => void);
	(event: "connected", listener: (clientId: string) => void);
	/*
	 * The readonly event is fired when the readonly state of the datastore runtime changes.
	 * The isReadOnly param will express the new readonly state.
	 */
	(event: "readonly", listener: (isReadOnly: boolean) => void);
}

/**
 * Manages the transmission of ops between the runtime and storage.
 * @legacy
 * @alpha
 */
export type IDeltaManagerErased =
	ErasedType<"@fluidframework/container-definitions.IDeltaManager<ISequencedDocumentMessage, IDocumentMessage>">;

/**
 * Represents the runtime for the data store. Contains helper functions/state of the data store.
 * @sealed
 * @legacy
 * @alpha
 */
export interface IFluidDataStoreRuntime
	extends IEventProvider<IFluidDataStoreRuntimeEvents>,
		IDisposable {
	readonly id: string;

	readonly IFluidHandleContext: IFluidHandleContext;

	readonly rootRoutingContext: IFluidHandleContext;
	readonly channelsRoutingContext: IFluidHandleContext;
	readonly objectsRoutingContext: IFluidHandleContext;

	// TODO: Use something other than `any` (breaking change)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly options: Record<string | number, any>;

	readonly deltaManager: IDeltaManagerErased;

	readonly clientId: string | undefined;

	readonly connected: boolean;

	/**
	 * Get the current readonly state.
	 * @returns true if read-only, otherwise false
	 */
	readonly isReadOnly: () => boolean;

	readonly logger: ITelemetryBaseLogger;

	/**
	 * Indicates the attachment state of the data store to a host service.
	 */
	readonly attachState: AttachState;

	/**
	 * An optional ID compressor.
	 * @remarks
	 * When provided, can be used to compress and decompress IDs stored in this datastore.
	 * Some SharedObjects, like SharedTree, require this.
	 */
	readonly idCompressor: IIdCompressor | undefined;

	/**
	 * Returns the channel with the given id
	 */
	getChannel(id: string): Promise<IChannel>;

	/**
	 * Creates a new channel of the given type.
	 * @param id - ID of the channel to be created.  A unique ID will be generated if left undefined.
	 * @param type - Type of the channel.
	 */
	createChannel(id: string | undefined, type: string): IChannel;

	/**
	 * Adds an existing channel to the data store.
	 *
	 * @remarks
	 * This allows callers to customize channel instance.
	 *
	 * For example, a channel implementation could have various modes of operations.
	 * As long as such configuration is provided at creation
	 * and stored in summaries (such that all users of such channel instance behave the same), this
	 * could be useful technique to have customized solutions without introducing a number of data structures
	 * that all have same implementation.
	 *
	 * This is also useful for scenarios like SharedTree DDS, where schema is provided at creation and stored in a summary.
	 *
	 * The channel type should be present in the registry, otherwise the runtime would reject
	 * the channel. The runtime used to create the channel object should be same to which
	 * it is added.
	 * @param channel - channel which needs to be added to the runtime.
	 */
	addChannel(channel: IChannel): void;

	/**
	 * Bind the channel with the data store runtime. If the runtime
	 * is attached then we attach the channel to make it live.
	 */
	bindChannel(channel: IChannel): void;

	// Blob related calls
	/**
	 * Api to upload a blob of data.
	 * @param blob - blob to be uploaded.
	 */
	uploadBlob(
		blob: ArrayBufferLike,
		signal?: AbortSignal,
	): Promise<IFluidHandle<ArrayBufferLike>>;

	/**
	 * Submits the signal to be sent to other clients.
	 * @param type - Type of the signal.
	 * @param content - Content of the signal. Should be a JSON serializable object or primitive.
	 * @param targetClientId - When specified, the signal is only sent to the provided client id.
	 */
	submitSignal: (type: string, content: unknown, targetClientId?: string) => void;

	/**
	 * Returns the current quorum.
	 */
	getQuorum(): IQuorumClients;

	/**
	 * Returns the current audience.
	 */
	getAudience(): IAudience;

	/**
	 * Resolves when a local data store is attached.
	 */
	waitAttached(): Promise<void>;

	/**
	 * Exposes a handle to the root object / entryPoint of the data store. Use this as the primary way of interacting
	 * with it.
	 */
	readonly entryPoint: IFluidHandle<FluidObject>;
}

/**
 * @experimental
 * @deprecated - These APIs are unstable, and can be changed at will. They should only be used with direct agreement with the Fluid Framework.
 * @legacy
 * @alpha
 * @sealed
 */
export interface IFluidDataStoreRuntimeExperimental extends IFluidDataStoreRuntime {
	readonly inStagingMode?: boolean;
	readonly isDirty?: boolean;
}

/**
 * Internal configs possibly implemented by IFuidDataStoreRuntimes, for use only within the runtime layer.
 * For example, temporary layer compatibility details
 *
 * @internal
 */
export interface IFluidDataStoreRuntimeInternalConfig {
	readonly submitMessagesWithoutEncodingHandles?: boolean;
}
