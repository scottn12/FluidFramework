/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ErasedType, IFluidHandle } from "@fluidframework/core-interfaces";
import { Lazy } from "@fluidframework/core-utils/internal";
import { UsageError } from "@fluidframework/telemetry-utils/internal";

import type { NodeKeyManager } from "../feature-libraries/index.js";
import { type MakeNominal, brand, isReadonlyArray } from "../util/index.js";
import type {
	Unhydrated,
	NodeKind,
	TreeNodeSchema,
	TreeNodeSchemaClass,
	TreeNode,
} from "./core/index.js";
import type { FieldKey } from "../core/index.js";
import type { InsertableContent } from "./toMapTree.js";
import { isLazy, type FlexListToUnion, type LazyItem } from "./flexList.js";

/**
 * Returns true if the given schema is a {@link TreeNodeSchemaClass}, or otherwise false if it is a {@link TreeNodeSchemaNonClass}.
 */
export function isTreeNodeSchemaClass<
	Name extends string,
	Kind extends NodeKind,
	TNode extends TreeNode | TreeLeafValue,
	TBuild,
	ImplicitlyConstructable extends boolean,
	Info,
>(
	schema: TreeNodeSchema<Name, Kind, TNode, TBuild, ImplicitlyConstructable, Info>,
): schema is TreeNodeSchemaClass<Name, Kind, TNode, TBuild, ImplicitlyConstructable, Info> {
	return schema.constructor !== undefined;
}

/**
 * Types for use in fields.
 * @remarks
 * Type constraint used in schema declaration APIs.
 * Not intended for direct use outside of package.
 * @public
 */
export type AllowedTypes = readonly LazyItem<TreeNodeSchema>[];

/**
 * Kind of a field on a node.
 * @remarks
 * More kinds may be added over time, so do not assume this is an exhaustive set.
 * @public
 */
export enum FieldKind {
	/**
	 * A field which can be empty or filled.
	 * @remarks
	 * Allows 0 or one child.
	 */
	Optional,
	/**
	 * A field which must always be filled.
	 * @remarks
	 * Only allows exactly one child.
	 */
	Required,
	/**
	 * A special field used for node identifiers.
	 * @remarks
	 * Only allows exactly one child.
	 */
	Identifier,
}

/**
 * Maps from a property key to its corresponding {@link FieldProps.key | stored key} for the provided
 * {@link ImplicitFieldSchema | field schema}.
 *
 * @remarks
 * If an explicit stored key was specified in the schema, it will be used.
 * Otherwise, the stored key is the same as the property key.
 */
export function getStoredKey(propertyKey: string, fieldSchema: ImplicitFieldSchema): FieldKey {
	return brand(getExplicitStoredKey(fieldSchema) ?? propertyKey);
}

/**
 * Gets the {@link FieldProps.key | stored key} specified by the schema, if one was explicitly specified.
 * Otherwise, returns undefined.
 */
export function getExplicitStoredKey(fieldSchema: ImplicitFieldSchema): string | undefined {
	return fieldSchema instanceof FieldSchema ? fieldSchema.props?.key : undefined;
}

/**
 * Additional information to provide to a {@link FieldSchema}.
 *
 * @typeParam TCustomMetadata - Custom metadata properties to associate with the field.
 * See {@link FieldSchemaMetadata.custom}.
 *
 * @public
 */
export interface FieldProps<TCustomMetadata = unknown> {
	/**
	 * The unique identifier of a field, used in the persisted form of the tree.
	 *
	 * @remarks
	 * If not explicitly set via the schema, this is the same as the schema's property key.
	 *
	 * Specifying a stored key that differs from the property key is particularly useful in refactoring scenarios.
	 * To update the developer-facing API, while maintaining backwards compatibility with existing SharedTree data,
	 * you can change the property key and specify the previous property key as the stored key.
	 *
	 * Notes:
	 *
	 * - Stored keys have no impact on standard JavaScript behavior, on tree nodes. For example, `Object.keys`
	 * will always return the property keys specified in the schema, ignoring any stored keys that differ from
	 * the property keys.
	 *
	 * - When specifying stored keys in an object schema, you must ensure that the final set of stored keys
	 * (accounting for those implicitly derived from property keys) contains no duplicates.
	 * This is validated at runtime.
	 *
	 * @example Refactoring code without breaking compatibility with existing data
	 *
	 * Consider some existing object schema:
	 *
	 * ```TypeScript
	 * class Point extends schemaFactory.object("Point", {
	 * 	xPosition: schemaFactory.number,
	 * 	yPosition: schemaFactory.number,
	 * 	zPosition: schemaFactory.optional(schemaFactory.number),
	 * });
	 * ```
	 *
	 * Developers using nodes of this type would access the the `xPosition` property as `point.xPosition`.
	 *
	 * We would like to refactor the schema to omit "Position" from the property keys, but application data has
	 * already been persisted using the original property keys. To maintain compatibility with existing data,
	 * we can refactor the schema as follows:
	 *
	 * ```TypeScript
	 * class Point extends schemaFactory.object("Point", {
	 * 	x: schemaFactory.required(schemaFactory.number, { key: "xPosition" }),
	 * 	y: schemaFactory.required(schemaFactory.number, { key: "yPosition" }),
	 * 	z: schemaFactory.optional(schemaFactory.number, { key: "zPosition" }),
	 * });
	 * ```
	 *
	 * Now, developers can access the `x` property as `point.x`, while existing data can still be collaborated on.
	 *
	 * @defaultValue If not specified, the key that is persisted is the property key that was specified in the schema.
	 */
	readonly key?: string;

	/**
	 * A default provider used for fields which were not provided any values.
	 * @privateRemarks
	 * We are using an erased type here, as we want to expose this API but `InsertableContent` and `NodeKeyManager` are not public.
	 */
	readonly defaultProvider?: DefaultProvider;

	/**
	 * Optional metadata to associate with the field.
	 * @remarks Note: this metadata is not persisted in the document.
	 */
	readonly metadata?: FieldSchemaMetadata<TCustomMetadata>;
}

/**
 * A {@link FieldProvider} which requires additional context in order to produce its content
 */
export type ContextualFieldProvider = (
	context: NodeKeyManager,
) => InsertableContent | undefined;
/**
 * A {@link FieldProvider} which can produce its content in a vacuum
 */
export type ConstantFieldProvider = () => InsertableContent | undefined;
/**
 * A function which produces content for a field every time that it is called
 */
export type FieldProvider = ContextualFieldProvider | ConstantFieldProvider;
/**
 * Returns true if the given {@link FieldProvider} is a {@link ConstantFieldProvider}
 */
export function isConstant(
	fieldProvider: FieldProvider,
): fieldProvider is ConstantFieldProvider {
	return fieldProvider.length === 0;
}

/**
 * Provides a default value for a field.
 * @remarks
 * If present in a `FieldSchema`, when constructing new tree content that field can be omitted, and a default will be provided.
 * @system @sealed @public
 */
export interface DefaultProvider extends ErasedType<"@fluidframework/tree.FieldProvider"> {}

export function extractFieldProvider(input: DefaultProvider): FieldProvider {
	return input as unknown as FieldProvider;
}

export function getDefaultProvider(input: FieldProvider): DefaultProvider {
	return input as unknown as DefaultProvider;
}

/**
 * Metadata associated with a {@link FieldSchema}.
 *
 * @remarks Specified via {@link FieldProps.metadata}.
 *
 * @sealed
 * @public
 */
export interface FieldSchemaMetadata<TCustomMetadata = unknown> {
	/**
	 * User-defined metadata.
	 */
	readonly custom?: TCustomMetadata;

	/**
	 * The description of the field.
	 *
	 * @remarks
	 *
	 * If provided, will be used by the system in scenarios where a description of the field is useful.
	 * E.g., when converting a field schema to {@link https://json-schema.org/ | JSON Schema}, this description will be
	 * used as the `description` field.
	 */
	readonly description?: string | undefined;
}

/**
 * Package internal construction API.
 */
export let createFieldSchema: <
	Kind extends FieldKind = FieldKind,
	Types extends ImplicitAllowedTypes = ImplicitAllowedTypes,
	TCustomMetadata = unknown,
>(
	kind: Kind,
	allowedTypes: Types,
	props?: FieldProps<TCustomMetadata>,
) => FieldSchema<Kind, Types, TCustomMetadata>;

/**
 * All policy for a specific field,
 * including functionality that does not have to be kept consistent across versions or deterministic.
 *
 * This can include policy for how to use this schema for "view" purposes, and well as how to expose editing APIs.
 * Use {@link SchemaFactory} to create the FieldSchema instances, for example {@link SchemaFactory.optional}.
 * @privateRemarks
 * Public access to the constructor is removed to prevent creating expressible but unsupported (or not stable) configurations.
 * {@link createFieldSchema} can be used internally to create instances.
 *
 * @typeParam TCustomMetadata - Custom metadata properties to associate with the field.
 * See {@link FieldSchemaMetadata.custom}.
 *
 * @sealed @public
 */
export class FieldSchema<
	out Kind extends FieldKind = FieldKind,
	out Types extends ImplicitAllowedTypes = ImplicitAllowedTypes,
	out TCustomMetadata = unknown,
> {
	static {
		createFieldSchema = <
			Kind2 extends FieldKind = FieldKind,
			Types2 extends ImplicitAllowedTypes = ImplicitAllowedTypes,
			TCustomMetadata2 = unknown,
		>(
			kind: Kind2,
			allowedTypes: Types2,
			props?: FieldProps<TCustomMetadata2>,
		) => new FieldSchema(kind, allowedTypes, props);
	}
	/**
	 * This class is used with instanceof, and therefore should have nominal typing.
	 * This field enforces that.
	 */
	protected _typeCheck!: MakeNominal;

	private readonly lazyTypes: Lazy<ReadonlySet<TreeNodeSchema>>;

	/**
	 * What types of tree nodes are allowed in this field.
	 * @remarks Counterpart to {@link FieldSchema.allowedTypes}, with any lazy definitions evaluated.
	 */
	public get allowedTypeSet(): ReadonlySet<TreeNodeSchema> {
		return this.lazyTypes.value;
	}

	/**
	 * True if and only if, when constructing a node with this field, a value must be provided for it.
	 */
	public readonly requiresValue: boolean;

	/**
	 * {@inheritDoc FieldProps.metadata}
	 */
	public get metadata(): FieldSchemaMetadata<TCustomMetadata> | undefined {
		return this.props?.metadata;
	}

	private constructor(
		/**
		 * The {@link https://en.wikipedia.org/wiki/Kind_(type_theory) | kind } of this field.
		 * Determines the multiplicity, viewing and editing APIs as well as the merge resolution policy.
		 */
		public readonly kind: Kind,
		/**
		 * What types of tree nodes are allowed in this field.
		 */
		public readonly allowedTypes: Types,
		/**
		 * Optional properties associated with the field.
		 */
		public readonly props?: FieldProps<TCustomMetadata>,
	) {
		this.lazyTypes = new Lazy(() => normalizeAllowedTypes(this.allowedTypes));
		// TODO: optional fields should (by default) get a default provider that returns undefined, removing the need to special case them here:
		this.requiresValue =
			this.props?.defaultProvider === undefined && this.kind !== FieldKind.Optional;
	}
}

/**
 * Normalizes a {@link ImplicitFieldSchema} to a {@link FieldSchema}.
 */
export function normalizeFieldSchema(schema: ImplicitFieldSchema): FieldSchema {
	return schema instanceof FieldSchema
		? schema
		: createFieldSchema(FieldKind.Required, schema);
}
/**
 * Normalizes a {@link ImplicitAllowedTypes} to a set of {@link TreeNodeSchema}s, by eagerly evaluating any
 * lazy schema declarations.
 *
 * @remarks Note: this must only be called after all required schemas have been declared, otherwise evaluation of
 * recursive schemas may fail.
 */
export function normalizeAllowedTypes(
	types: ImplicitAllowedTypes,
): ReadonlySet<TreeNodeSchema> {
	const normalized = new Set<TreeNodeSchema>();
	if (isReadonlyArray(types)) {
		for (const lazyType of types) {
			normalized.add(evaluateLazySchema(lazyType));
		}
	} else {
		normalized.add(evaluateLazySchema(types));
	}
	return normalized;
}

function evaluateLazySchema(value: LazyItem<TreeNodeSchema>): TreeNodeSchema {
	const evaluatedSchema = isLazy(value) ? value() : value;
	if (evaluatedSchema === undefined) {
		throw new UsageError(
			`Encountered an undefined schema. This could indicate that some referenced schema has not yet been instantiated.`,
		);
	}
	return evaluatedSchema;
}

/**
 * Types allowed in a field.
 * @remarks
 * Implicitly treats a single type as an array of one type.
 * @public
 */
export type ImplicitAllowedTypes = AllowedTypes | TreeNodeSchema;

/**
 * Schema for a field of a tree node.
 * @remarks
 * Implicitly treats {@link ImplicitAllowedTypes} as a Required field of that type.
 * @public
 */
export type ImplicitFieldSchema = FieldSchema | ImplicitAllowedTypes;

/**
 * Converts an `ImplicitFieldSchema` to a property type suitable for reading a field with this that schema.
 *
 * @typeparam TSchema - When non-exact schema are provided this errors on the side of returning too general of a type (a conservative union of all possibilities).
 * This is ideal for "output APIs" - i.e. it converts the schema type to the runtime type that a user will _read_ from the tree.
 * Examples of such "non-exact" schema include `ImplicitFieldSchema`, `ImplicitAllowedTypes`, and  TypeScript unions of schema types.
 * @privateRemarks
 * TODO:
 * There are two known problematic usages of this type (which produce invalid/unsound results when given non-specific schema):
 * 1. setters for fields (on object nodes the Tree.view.root).
 * 2. Indirectly in InsertableTreeFieldFromImplicitField via InsertableTypedNode including NodeFromSchema.
 * These cases should be mitigated by introducing a way to detect inexact schema and special casing them in these two places.
 * @public
 */
export type TreeFieldFromImplicitField<TSchema extends ImplicitFieldSchema = FieldSchema> =
	TSchema extends FieldSchema<infer Kind, infer Types>
		? ApplyKind<TreeNodeFromImplicitAllowedTypes<Types>, Kind, false>
		: TSchema extends ImplicitAllowedTypes
			? TreeNodeFromImplicitAllowedTypes<TSchema>
			: TreeNode | TreeLeafValue | undefined;

/**
 * Type of content that can be inserted into the tree for a field of the given schema.
 * @public
 */
export type InsertableTreeFieldFromImplicitField<
	TSchema extends ImplicitFieldSchema = FieldSchema,
> = TSchema extends FieldSchema<infer Kind, infer Types>
	? ApplyKind<InsertableTreeNodeFromImplicitAllowedTypes<Types>, Kind, true>
	: TSchema extends ImplicitAllowedTypes
		? InsertableTreeNodeFromImplicitAllowedTypes<TSchema>
		: never;

/**
 * {@inheritdoc (UnsafeUnknownSchema:type)}
 * @alpha
 */
export const UnsafeUnknownSchema: unique symbol = Symbol("UnsafeUnknownSchema");

/**
 * A special type which can be provided to some APIs as the schema type parameter when schema cannot easily be provided at compile time and an unsafe (instead of disabled) editing API is desired.
 * @remarks
 * When used, this means the TypeScript typing should err on the side of completeness (allow all inputs that could be valid).
 * This introduces the risk that out-of-schema data could be allowed at compile time, and only error at runtime.
 *
 * @privateRemarks
 * This only applies to APIs which input data which is expected to be in schema, since APIs outputting have easy mechanisms to do so in a type safe way even when the schema is unknown.
 * In most cases that amounts to returning `TreeNode | TreeLeafValue`.
 *
 * This can be contrasted with the default behavior of TypeScript, which is to require the intersection of the possible types for input APIs,
 * which for unknown schema defining input trees results in the `never` type.
 *
 * Any APIs which use this must produce UsageErrors when out of schema data is encountered, and never produce unrecoverable errors,
 * or silently accept invalid data.
 * This is currently only type exported from the package: the symbol is just used as a way to get a named type.
 * @alpha
 */
export type UnsafeUnknownSchema = typeof UnsafeUnknownSchema;

/**
 * Content which could be inserted into a tree.
 * @remarks
 * Extended version of {@link InsertableTreeNodeFromImplicitAllowedTypes} that also allows {@link (UnsafeUnknownSchema:type)}.
 * @alpha
 */
export type Insertable<TSchema extends ImplicitAllowedTypes | UnsafeUnknownSchema> =
	TSchema extends ImplicitAllowedTypes
		? InsertableTreeNodeFromImplicitAllowedTypes<TSchema>
		: InsertableContent;

/**
 * Content which could be inserted into a field within a tree.
 * @remarks
 * Extended version of {@link InsertableTreeFieldFromImplicitField} that also allows {@link (UnsafeUnknownSchema:type)}.
 * @alpha
 */
export type InsertableField<TSchema extends ImplicitFieldSchema | UnsafeUnknownSchema> =
	TSchema extends ImplicitFieldSchema
		? InsertableTreeFieldFromImplicitField<TSchema>
		: InsertableContent | undefined;

/**
 * Suitable for output.
 * For input must error on side of excluding undefined instead.
 * @system @public
 */
export type ApplyKind<T, Kind extends FieldKind, DefaultsAreOptional extends boolean> = {
	[FieldKind.Required]: T;
	[FieldKind.Optional]: T | undefined;
	[FieldKind.Identifier]: DefaultsAreOptional extends true ? T | undefined : T;
}[Kind];

/**
 * Type of tree node for a field of the given schema.
 * @public
 */
export type TreeNodeFromImplicitAllowedTypes<
	TSchema extends ImplicitAllowedTypes = TreeNodeSchema,
> = TSchema extends TreeNodeSchema
	? NodeFromSchema<TSchema>
	: TSchema extends AllowedTypes
		? NodeFromSchema<FlexListToUnion<TSchema>>
		: unknown;

/**
 * Type of content that can be inserted into the tree for a node of the given schema.
 * @public
 */
export type InsertableTreeNodeFromImplicitAllowedTypes<
	TSchema extends ImplicitAllowedTypes = TreeNodeSchema,
> = TSchema extends TreeNodeSchema
	? InsertableTypedNode<TSchema>
	: TSchema extends AllowedTypes
		? InsertableTypedNode<FlexListToUnion<TSchema>>
		: never;

/**
 * Takes in `TreeNodeSchema[]` and returns a TypedNode union.
 * @public
 */
export type NodeFromSchema<T extends TreeNodeSchema> = T extends TreeNodeSchema<
	string,
	NodeKind,
	infer TNode
>
	? TNode
	: never;

/**
 * Data which can be used as a node to be inserted.
 * Either an unhydrated node, or content to build a new node.
 * @privateRemarks
 * TODO:
 * This should behave contravariantly, but it uses NodeFromSchema which behaves covariantly.
 * This results in unsoundness where, when the schema is less specific, more types are allowed instead of less.
 * @public
 */
export type InsertableTypedNode<T extends TreeNodeSchema> =
	| (T extends { implicitlyConstructable: true } ? NodeBuilderData<T> : never)
	| Unhydrated<NodeFromSchema<T>>;

/**
 * Given a node's schema, return the corresponding object from which the node could be built.
 * @privateRemarks
 * Currently this assumes factory functions take exactly one argument.
 * This could be changed if needed.
 *
 * These factory functions can also take a FlexTreeNode, but this is not exposed in the public facing types.
 * @system @public
 */
export type NodeBuilderData<T extends TreeNodeSchema> = T extends TreeNodeSchema<
	string,
	NodeKind,
	TreeNode | TreeLeafValue,
	infer TBuild
>
	? TBuild
	: never;

/**
 * Value that may be stored as a leaf node.
 * @remarks
 * Some limitations apply, see the documentation for {@link SchemaFactory.number} and {@link SchemaFactory.string} for those restrictions.
 * @public
 */
// eslint-disable-next-line @rushstack/no-new-null
export type TreeLeafValue = number | string | boolean | IFluidHandle | null;
