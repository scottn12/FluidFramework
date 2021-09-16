/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Our public API is exposed by re-exporting things from 'internal' packages in 'external' packages, like
 * fluid-framework. API Extractor does not extract re-exported APIs, so this script manipulates the API Extractor JSON
 * output to merge and re-write the API JSON as a workaround.
 *
 * This script changes source files in place; you may want to create a copy of the source files prior to running this
 * script on them. If you're using the tasks defined in package.json, then you don't need to do this; those scripts
 * create copies.
 */

const fs = require("fs");

const apiPath = process.argv[2];

/**
 * Given a package name, returns its name and path as a tuple.
 * @param {string} package
 */
const parsePackage = (package) => {
    const name = package.includes("/") ? package.split("/")[1] : package;
    const path = `${apiPath}/${name}.api.json`;
    return [name, path];
};

/**
 * @param {string} input
 * @param {string} sourcePackage
 * @param {string} targetPackage
 * @returns {string} The updated string.
 */
const rewirePackage = (input, sourcePackage, targetPackage) => input.replace(sourcePackage, targetPackage);

/**
 * @param {string} package the name of a package containing re-exported APIs.
 * @param {string} sourcePackage the name of the package that is the source of the re-exported APIs.
 */
const rewriteImports = async (package, sourcePackage) => {
    const [_, path] = parsePackage(package);

    try {
        console.log(`Loading ${path}`);
        const jsonStr = fs.readFileSync(path, "utf8");
        const updated = rewirePackage(jsonStr, sourcePackage, package);
        fs.writeFileSync(path, updated);
    } catch (ex) {
        console.log(ex);
    }
};

/**
 * @param {string} package the name of a package that rolls up exported APIs from abother package.
 * @param {string} sourcePackages an array of package names whose contents should be rolled up into `package`.
 */
const rollupPackage = async (package, sourcePackages) => {
    const rollup = [];
    for (const sourcePackage of sourcePackages) {
        const [_, sourcePath] = parsePackage(sourcePackage);
        try {
            const apiJson = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
            rollup.push(...apiJson.members[0].members);
        } catch (ex) {
            console.log(ex);
        }
    }

    const [_, packagePath] = parsePackage(package);
    try {
        const json = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        json.members[0].members = rollup;
        const jsonStr = JSON.stringify(json);

        // rewire every re-exported package
        const results = rewirePackage(jsonStr, package, packagePath);
        fs.writeFileSync(packagePath, results);
    } catch (ex) {
        console.log(ex);
    }
};

const start = async () => {
    // Rewrite fluid-static imports from container-definitions
    rewriteImports("@fluidframework/fluid-static", "@fluidframework/container-definitions");

    // fluid-framework re-exports all of fluid-static
    rollupPackage("fluid-framework", ["@fluidframework/fluid-static"]);
};

start();
