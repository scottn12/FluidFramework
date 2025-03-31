/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { assert } from "@fluidframework/core-utils/internal";
import { FlushMode } from "@fluidframework/runtime-definitions/internal";
import * as semver from "semver";

import {
	type ICompressionRuntimeOptions,
	type IContainerRuntimeOptionsInternal,
} from "./containerRuntime.js";
import { pkgVersion } from "./packageVersion.js";

/**
 * Available compression algorithms for op compression.
 * @legacy
 * @alpha
 */
export enum CompressionAlgorithms {
	lz4 = "lz4",
}

/**
 * @legacy
 * @alpha
 */
export const disabledCompressionConfig: ICompressionRuntimeOptions = {
	minimumBatchSizeInBytes: Number.POSITIVE_INFINITY,
	compressionAlgorithm: CompressionAlgorithms.lz4,
};

export const enabledCompressionConfig = {
	// Batches with content size exceeding this value will be compressed
	minimumBatchSizeInBytes: 614400,
	compressionAlgorithm: CompressionAlgorithms.lz4,
};

const defaultFlushMode = FlushMode.TurnBased;

/**
 * Subset of the IContainerRuntimeOptionsInternal properties which are version-dependent.
 */
type IContainerRuntimeOptionsVersionDependent = Pick<
	IContainerRuntimeOptionsInternal,
	| "flushMode"
	| "enableGroupedBatching"
	| "explicitSchemaControl"
	| "enableRuntimeIdCompressor"
	| "compressionOptions"
	| "gcOptions"
>;

/**
 * Map of IContainerRuntimeOptionsInternal to compat related information.
 * The key is the option name, and the value is an object containing:
 * - minVersionRequired: The minimum version of the container runtime that supports the version-dependent option
 * - legacyConfig: The default config of the option when the runtime does not meets the min version requirement
 * - modernConfig: The default config of the option when the runtime meets the min version requirement
 *
 * TODO: Get the exact versions that each option was added in.
 */
const runtimeOptionConfigs: {
	[K in keyof IContainerRuntimeOptionsVersionDependent]: {
		minVersionRequired: string;
		legacyConfig: IContainerRuntimeOptionsVersionDependent[K];
		modernConfig: IContainerRuntimeOptionsVersionDependent[K];
	};
} = {
	flushMode: {
		minVersionRequired: "2.0.0",
		legacyConfig: FlushMode.Immediate,
		modernConfig: defaultFlushMode,
	},
	enableGroupedBatching: {
		minVersionRequired: "2.0.0",
		legacyConfig: false,
		modernConfig: true,
	},
	explicitSchemaControl: {
		minVersionRequired: "2.0.0",
		legacyConfig: false,
		modernConfig: true,
	},
	enableRuntimeIdCompressor: {
		minVersionRequired: "2.0.0",
		legacyConfig: undefined,
		modernConfig: "on",
	},
	compressionOptions: {
		minVersionRequired: "2.0.0",
		legacyConfig: disabledCompressionConfig,
		modernConfig: enabledCompressionConfig,
	},
	gcOptions: {
		minVersionRequired: "2.0.0",
		legacyConfig: { gcSweep: undefined },
		modernConfig: { gcSweep: true },
	},
};

/**
 * Returns the default configs for a given compatibility mode.
 */
export function getConfigsForCompatMode(
	compatibilityMode: Required<IContainerRuntimeOptionsInternal>["compatibilityMode"],
): IContainerRuntimeOptionsInternal {
	const defaultConfigs: {
		[K in keyof IContainerRuntimeOptionsVersionDependent]: IContainerRuntimeOptionsVersionDependent[K];
	} = {};
	for (const key of Object.keys(runtimeOptionConfigs)) {
		const config = runtimeOptionConfigs[key as keyof IContainerRuntimeOptionsVersionDependent];
		assert(config !== undefined, "config should be defined");
		// If the compatibility mode is greater than or equal to the minimum version
		// required for this option, use the "modern" config value, otherwise use the "legacy" config value
		const isModernConfig = semver.gte(compatibilityMode, config.minVersionRequired);
		defaultConfigs[key] = isModernConfig ? config.modernConfig : config.legacyConfig;
	}
	return defaultConfigs;
}

/**
 * Checks if the compatibility mode is valid.
 * A valid compatibility mode is a string that is a valid semver version and is less than or equal to the current package version.
 */
export function isValidCompatMode(
	compatibilityMode: Required<IContainerRuntimeOptionsInternal["compatibilityMode"]>,
): boolean {
	return (
		compatibilityMode !== undefined &&
		semver.valid(compatibilityMode) !== null &&
		semver.lte(compatibilityMode, pkgVersion)
	);
}
