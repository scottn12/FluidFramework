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
import { SharedMap as SharedMapLegacy } from "@fluidframework/map-legacy";
import { timeoutPromise } from "@fluidframework/test-utils/internal";

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
		for (let i = 0; i < 10; i++) {
			container1.initialObjects.map1.set("key", `value${i}`);
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
});
