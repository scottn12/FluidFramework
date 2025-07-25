/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Provides a simple and powerful way to consume collaborative Fluid data.
 *
 * @packageDocumentation
 */

export {
	createFluidContainer,
	isInternalFluidContainer,
	type IFluidContainer,
	type IFluidContainerEvents,
	type IFluidContainerInternal,
	type InitialObjects,
} from "./fluidContainer.js";
export { createDOProviderContainerRuntimeFactory } from "./rootDataObject.js";
export { createServiceAudience } from "./serviceAudience.js";
export { createTreeContainerRuntimeFactory } from "./treeRootDataObject.js";
export type {
	CompatibilityMode,
	ContainerSchema,
	ContainerAttachProps,
	IConnection,
	IMember,
	IServiceAudience,
	IServiceAudienceEvents,
	MemberChangedListener,
	Myself,
	TreeContainerSchema,
} from "./types.js";
export { isTreeContainerSchema } from "./utils.js";
