/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";

import { describeCompat } from "@fluid-private/test-version-utils";
import {
	ChannelFactoryRegistry,
	DataObjectFactoryType,
	ITestContainerConfig,
	ITestObjectProvider,
} from "@fluidframework/test-utils/internal";

describeCompat.only("SharedMap", "FullCompat", (getTestObjectProvider, apis) => {
	const { SharedMap } = apis.dds;
	const mapId = "mapKey";
	const registry: ChannelFactoryRegistry = [[mapId, SharedMap.getFactory()]];
	const testContainerConfigWithSchemaControl: ITestContainerConfig = {
		fluidDataObjectType: DataObjectFactoryType.Test,
		registry,
		runtimeOptions: {
			explicitSchemaControl: true,

		},
	};
	const testContainerConfigWithoutSchemaControl: ITestContainerConfig = {
		fluidDataObjectType: DataObjectFactoryType.Test,
		registry,
		runtimeOptions: {
			explicitSchemaControl: true,

		},
	};

	let provider: ITestObjectProvider;
	beforeEach("getTestObjectProvider", function () {
		provider = getTestObjectProvider();
		if (provider.type !== "TestObjectProviderWithVersionedLoad") {
			// This test is only for versioned loader
			this.skip();
		}
	});

	it("document schema test explicitSchemaControl = true", async () => {
		const container1 = await provider.makeTestContainer(testContainerConfigWithSchemaControl);
		const container2 = await provider.loadTestContainer(testContainerConfigWithSchemaControl);
		// await assert.doesNotReject(resources, () => true, "container could not be loaded");

		assert(container1);
		assert(container2);
		await provider.ensureSynchronized();
	});

	it("document schema test explicitSchemaControl = true, then true", async () => {
		const container1 = await provider.makeTestContainer(testContainerConfigWithoutSchemaControl);
		const container2 = await provider.loadTestContainer(testContainerConfigWithoutSchemaControl);
		// await assert.doesNotReject(resources, () => true, "container could not be loaded");

		assert(container1);
		assert(container2);
		await provider.ensureSynchronized();

		const container3 = await provider.loadTestContainer(testContainerConfigWithoutSchemaControl);
	});


});
