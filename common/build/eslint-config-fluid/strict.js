/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * "Strict" eslint configuration.
 *
 * This configuration is recommended, in particular, for packages whose APIs are expected to be used externally.
 * It is additionally recommended for the following scenarios:
 *
 * * Critical libraries - those where particular attention to code quality might prevent severe issues.
 *
 * * Publicized examples - any libraries, sample applications, etc. we expect external consumers to use for reference.
 */
module.exports = {
	env: {
		browser: true,
		es6: true,
		es2024: false,
		node: true,
	},
	extends: ["./recommended.js"],
	rules: {
		/**
		 * Require jsdoc/tsdoc comments on public/exported API items.
		 */
		"jsdoc/require-jsdoc": [
			"error",
			{
				// Indicates that only module exports should be flagged for lacking jsdoc comments
				publicOnly: true,
				// Prevents eslint from adding empty comment blocks when run with `--fix`
				enableFixer: false,
				require: {
					ArrowFunctionExpression: true,
					ClassDeclaration: true,
					ClassExpression: true,
					FunctionDeclaration: true,
					FunctionExpression: true,

					// Will report for *any* methods on exported classes, regardless of whether or not they are public
					MethodDefinition: false,
				},
				contexts: [
					"TSEnumDeclaration",
					"TSInterfaceDeclaration",
					"TSTypeAliasDeclaration",

					// Require JSDoc/TSDoc comments on variable declarations, but only those that are named exports.
					// Specifying just "VariableDeclaration" results in eslint flagging all variable declarations scoped within something that is exported, including in the body of functions, which is not desired.
					"ExportNamedDeclaration > VariableDeclaration",
				],
			},
		],
	},
	overrides: [
		{
			// Rules only for TypeScript files
			files: ["*.ts", "*.tsx"],
			rules: {
				"@typescript-eslint/explicit-member-accessibility": [
					"error",
					{
						accessibility: "explicit",
						overrides: {
							accessors: "explicit",
							constructors: "explicit",
							methods: "explicit",
							properties: "explicit",
							parameterProperties: "explicit",
						},
					},
				],

				/**
				 * Prefer Record to index-signature object style. That is, prefer:
				 *
				 * ```ts
				 * type Foo = Record<string, unknown>;
				 * ```
				 *
				 * to
				 *
				 * ```ts
				 * type Foo = {
				 *   [key: string]: unknown;
				 * }
				 * ```
				 */
				"@typescript-eslint/consistent-indexed-object-style": "error",

				/**
				 * Flags when an enum-typed value is compared to a non-enum number.
				 */
				"@typescript-eslint/no-unsafe-enum-comparison": "error",

				/**
				 * Prefer generic type annotations on the constructor.
				 *
				 * @example
				 *
				 * This:
				 *
				 * ```ts
				 * const map = new Map<string, number>();
				 * ```
				 *
				 * instead of:
				 *
				 * ```ts
				 * const map: Map<string, number> = new Map();
				 * ```
				 */
				"@typescript-eslint/consistent-generic-constructors": "error",

				"@typescript-eslint/no-redundant-type-constituents": "error",
			},
		},
	],
};
