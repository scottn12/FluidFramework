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
	let client1: AzureClient;
	let client2: AzureClientLegacy;
	const schema = {
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
		client1 = createAzureClient();
		client2 = createAzureClientLegacy();
	});

	it("1.X container can get container made by 2.X", async () => {
		const { container } = await client1.createContainer(schema);
		const containerId = await container.attach();

		if (container.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container connect() timeout",
			});
		}
		container.initialObjects.map1.set("key", "value");

		const resources = client2.getContainer(containerId, schemaLegacy);
		await assert.doesNotReject(resources, () => true, "container could not be loaded");

		const { container: containerLegacy } = await resources;
		if (containerLegacy.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => containerLegacy.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container connect() timeout",
			});
		}

		const result = (await (containerLegacy.initialObjects.map1 as SharedMapLegacy).get(
			"key",
		)) as string;
		assert.strictEqual(result, "value", "Value not found in copied container");
	});

	it("2.X container can get container made by 1.X", async () => {
		const { container: containerLegacy } = await client2.createContainer(schemaLegacy);
		const containerLegacyId = await containerLegacy.attach();

		if (containerLegacy.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => containerLegacy.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container connect() timeout",
			});
		}

		const resources = client1.getContainer(containerLegacyId, schema);
		await assert.doesNotReject(resources, () => true, "container could not be loaded");

		const { container } = await resources;

		if (container.connectionState !== ConnectionState.Connected) {
			await timeoutPromise((resolve) => container.once("connected", () => resolve()), {
				durationMs: connectTimeoutMs,
				errorMsg: "container connect() timeout",
			});
		}

		const result = (await container.initialObjects.map1.get("key")) as string;
		assert.strictEqual(result, "value", "Value not found in copied container");
	});
});
