/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";

import { AzureClient } from "@fluidframework/azure-client";
import { AzureClient as AzureClientLegacy } from "@fluidframework/azure-client-legacy";

import { ConnectionState } from "@fluidframework/container-loader";
import { ContainerSchema } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map/internal";
import { SchemaFactory, SharedTree, TreeConfiguration } from "@fluidframework/tree";
import { SharedMap as SharedMapLegacy } from "@fluidframework/map-legacy";
import { timeoutPromise } from "@fluidframework/test-utils/internal";

// import { IContainer } from "@fluidframework/container-definitions/internal";
import { createAzureClient, createAzureClientLegacy } from "./AzureClientFactory.js";

describe.only("CrossVersion compat testing", () => {
	const connectTimeoutMs = 10_000;
	let clientCurrent: AzureClient;
	let clientLegacy: AzureClientLegacy;
	const schemaCurrent = {
		initialObjects: {
			map1: SharedMap,
		},
	} satisfies ContainerSchema;

	const schemaLegacy = {
		initialObjects: {
			map1: SharedMapLegacy,
		},
	};

	beforeEach("createAzureClients", () => {
		clientCurrent = createAzureClient();
		clientLegacy = createAzureClientLegacy();
	});

	it("1.X container can get container made by 2.X", async () => {
		const { container: container1 } = await clientCurrent.createContainer(schemaCurrent);
		const containerId = await container1.attach();

		if (container1.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container1.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container1 connect() timeout",
			});
		}

		const resources = clientLegacy.getContainer(containerId, schemaLegacy);
		await assert.doesNotReject(resources, () => true, "container could not be loaded");

		const { container: container2 } = await resources;
		if (container2.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container2.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container2 connect() timeout",
			});
		}

		const result = (await (container2.initialObjects.map1 as SharedMapLegacy).get(
			"key",
		)) as string;
		assert.strictEqual(result, "value9", "Value not found in copied container");
	});

	it("2.X container can get container made by 1.X", async () => {
		const { container: container1 } = await clientLegacy.createContainer(schemaLegacy);
		const containerId = await container1.attach();

		if (container1.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container1.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container1 connect() timeout",
			});
		}

		(container1.initialObjects.map1 as SharedMapLegacy).set("key", "value");

		const resources = clientCurrent.getContainer(containerId, schemaCurrent);
		await assert.doesNotReject(resources, () => true, "container could not be loaded");

		const { container: container2 } = await resources;

		if (container2.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container2.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container2 connect() timeout",
			});
		}

		const result = (await container2.initialObjects.map1.get("key")) as string;
		assert.strictEqual(result, "value", "Value not found in copied container");
	});

	it.only("id compressor", async () => {
		const { container: container1 } = await clientCurrent.createContainer(schemaCurrent);
		const containerId = await container1.attach();

		if (container1.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container1.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container1 connect() timeout",
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		const entryPoint = (await (container1 as any).container.getEntryPoint()) as any;

		// Create a new DDS - it will force ID compressor ops to flow.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		const channel = entryPoint.runtime.createChannel(
			undefined,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			entryPoint.root.attributes.type,
		);
		// Make sure creation process completes - DDS is attached to container.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		channel.bindToContext();

		const resources = clientLegacy.getContainer(containerId, schemaLegacy);
		const { container: container2 } = await resources;
		if (container2.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container2.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container2 connect() timeout",
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
		assert(!(container1 as any).container.closed);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
		assert(!(container2 as any).container.closed);
	});

	it.skip("SharedTree (Create with 1.X)", async () => {
		const schemaTree = {
			initialObjects: {
				map1: SharedMap,
				tree1: SharedTree,
			},
		} satisfies ContainerSchema;

		const { container: container1 } = await clientLegacy.createContainer(schemaLegacy);
		const containerId = await container1.attach();

		if (container1.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container1.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container1 connect() timeout",
			});
		}
		(container1.initialObjects.map1 as SharedMapLegacy).set("key", "value");

		const resources = clientCurrent.getContainer(containerId, schemaTree);
		await assert.doesNotReject(resources, () => true, "container could not be loaded");

		const { container: container2 } = await resources;
		if (container2.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container2.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container2 connect() timeout",
			});
		}

		const result = (await container2.initialObjects.map1.get("key")) as string;
		assert.strictEqual(result, "value", "Value not found in copied container");

		const sf = new SchemaFactory("d302b84c-75f6-4ecd-9663-524f467013e3");
		class StringArray extends sf.array("StringArray", sf.string) {
			public removeFirst(): void {
				if (this.length > 0) this.removeAt(0);
			}
			public insertNew(): void {
				this.insertAtStart("");
			}
		}
		const treeConfiguration = new TreeConfiguration(StringArray, () => new StringArray([]));
		container2.initialObjects.tree1.schematize(treeConfiguration);
	});

	it.skip("SharedTree (Create with 2.X)", async () => {
		const schemaTree = {
			initialObjects: {
				map1: SharedMap,
				tree1: SharedTree,
			},
		} satisfies ContainerSchema;

		const { container: container1 } = await clientCurrent.createContainer(schemaTree);
		const containerId = await container1.attach();

		if (container1.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container1.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container1 connect() timeout",
			});
		}

		const sf = new SchemaFactory("d302b84c-75f6-4ecd-9663-524f467013e3");
		class StringArray extends sf.array("StringArray", sf.string) {
			public removeFirst(): void {
				if (this.length > 0) this.removeAt(0);
			}
			public insertNew(): void {
				this.insertAtStart("");
			}
		}
		const treeConfiguration = new TreeConfiguration(StringArray, () => new StringArray([]));
		container1.initialObjects.tree1.schematize(treeConfiguration);

		const resources = clientLegacy.getContainer(containerId, schemaLegacy);
		await assert.doesNotReject(resources, () => true, "container could not be loaded");

		const { container: container2 } = await resources;
		if (container2.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container2.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container2 connect() timeout",
			});
		}
	});
});
