# Website

This directory contains the code and content for <https://fluidframework.com>.

The website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Dependency installation

The Fluid Framework repository uses [pnpm](https://pnpm.io/) for dependency management.
If you don't have `pnpm` installed, you will need to do so first.

```shell
pnpm i
```

## Local Development

There are two options for local testing.

### `build:generate-content` and `start`

The easiest way to get started testing the website is to leverage Docusaurus's `start` functionality.
This command starts a local development server and opens up a browser window.
Most changes are reflected live without having to restart the server.

Before you can use this, you'll need to ensure our API documentation has been built.
So start by running:

```shell
npm run build:generate-content
```

Then, run:

```shell
npm start
```

##### Typesense Search

The search function on the website is implemented with Typesense.
To test search locally, you must first build and then use either:

-   `pnpm run start`
-   `pnpm run serve`

Both commands work as long a you have the appropriate values set in your `.env` file (for example: TYPESENSE_HOST and TYPESENSE_API_KEY).
Note: This setup and the required API keys are limited to Microsoft internal employees; detailed instructions can be found on the internal wiki.

Note: the Docusaurus build is fairly slow.
If you don't need to test search, it is recommended to run `pnpm run start` instead.
This is faster, and will watch for content changes and update automatically.
You will still need to build the API documentation first.

### Local API docs build

To include repo-local API documentation when building the site locally, you will first need to do the following:

1. Build the code from the root of the repo.
2. Create a `.env` file in this directory with the following contents:
    ```
    LOCAL_API_DOCS=true
    ```

So long as the `LOCAL_API_DOCS` environment variable is set to `true`, local API documentation will be included when building the site.
To remove the local API docs, simply remove the above variable or set it to `false`, `npm run clean` and rebuild as needed.

## User Telemetry

The Fluid Framework website collects basic user telemetry to help improve the experience for our users.
The telemetry data includes anonymous information such as:

-   Daily / Monthly users
-   Pages visited
-   User flow

This data is collected in compliance with relevant privacy standards.
For more information, please refer to our [privacy policy.](https://www.microsoft.com/privacy/privacystatement).
If you have any concerns about telemetry, please reach out to our team via [GitHub Issues](https://github.com/microsoft/FluidFramework/issues).

To test this telemetry locally add the following key to the .env file.
This key is used to instantiate Application Insights so that usage events can be tracked.
The key can be requested from internal Microsoft Fluid Framework engineers.

```
INSTRUMENTATION_KEY=<key>
```

## Deployment

The Fluid Framework website is deployed using the build-docs pipeline. `INSTRUMENTATION_KEY`
is set as a pipeline variable here.

## Writing site documentation

For details about authoring documentation content in Docusaurus, see [here](https://docusaurus.io/docs/create-doc).

### File organization

```
|--- docs (Current version documentation)
|--- versioned_docs (previous and future version documentation)
|    |---version-x (version *x* documentation)
|    |---version-local (special directory in which repo-local API docs are generated and can be previewed when building the site locally)
|--- src
|    |--- components (React components available to other site documents, pages, and components)
|    |--- css (CSS modules available to other site documents, pages, and components)
|    |--- pages (Unversioned site contents)
|    |--- theme (Theme component / page overrides)
```

### MDX

MDX syntax (supported by Docusaurus) is powerful.
But there is a subset of standard Markdown syntax that is not supported.
For example, any HTML-like syntax will _always_ be treated as JSX syntax, so standard embedded HTML patterns don't work.
Most of the time, this isn't an issue, since substituting JSX syntax is generally fine.
With some exceptions.

#### Leveraging React components

For an overview of how to leverage React components in MDX documentation, see [here](https://docusaurus.io/docs/markdown-features/react).

##### Adding React components

React components should be saved under `src/components/...`.
They can be imported in other components, pages, and documents via `@site/src/components/...`.

#### Comments

A common pattern for adding inline comments in `.md` files looks like:

```md
<!-- I am a comment -->
```

The replacement syntax to use in `.mdx` files would be:

```mdx
{/* I am a comment */}
```

(just like you would do in a JSX context!)

#### Custom Heading IDs

In GitHub-flavored Markdown, you can assign a custom anchor ID to a heading by appending `{#<id>}` to the heading text.
E.g.,

```markdown
# Foo {#bar}
```

Because curly braces are interpreted specially by JSX, this syntax doesn't work as is in `.mdx` documents.
Instead, you'll need to escape the opening brace to prevent MDX from attempting to process the syntax as JSX.
E.g.,

```markdown
# Foo \{#bar}
```

See the following Docusaurus issue for more context: <https://github.com/facebook/docusaurus/issues/9155>.

### Mermaid

Docusaurus has built-in support for [mermaid](https://mermaid.js.org/) diagrams.
We recommend leveraging these when possible over alternatives (ascii art, binary image files, SVG, etc.).

Rationale:

-   Docusaurus will ensure consistent styling
-   Non-binary source, directly in the document.

For more details about leveraging Mermaid diagrams in Docusaurus, see [here](https://docusaurus.io/docs/markdown-features/diagrams).

### Documents vs Pages

_Documents_ and _Pages_ are distinct concepts in Docusaurus.
For an overview of each, see: [Documents](https://docusaurus.io/docs/docs-introduction) and [Pages](https://docusaurus.io/docs/creating-pages).

Some primary distinctions:

1. _Documents_ live under `docs` and `versioned_docs`. _Pages_ live under `src/pages`.
1. _Documents_ are versioned. _Pages_ are not.

### The Sidebar

For an overview of how to configure sidebars in Docusaurus, see [here](https://docusaurus.io/docs/sidebar).

The site's "current" version sidebar is configured via `sidebars.ts`.

Sidebars for other versions are configured via `versioned_sidebars/version-<version-id>.json`.

-   Versioned sidebars do not yet support JS/TS file formats.
    See <https://github.com/facebook/docusaurus/issues/10407>.

Note that sidebars are configured for documents under `docs` and `versioned_docs`; they do not apply to unversioned _Pages_.

### Documentation Versioning

For an overview of Docusaurus's versioning functionality, see [here](https://docusaurus.io/docs/versioning).

We currently offer versioned documentation for each of our supported major versions.
This documentation is intended to be kept up-to-date with the most recent release of each major version series.

For now, this means we publish documentation (including generated API documentation) for versions `1.x` and `2.x`.

-   We also support generating API documentation for the local repo code in local development only.
    See [Local API docs build](#local-api-docs-build), but these are not intended to be published.

#### Why Only Major Versions?

We aim to keep the number of concurrently maintained site versions minimized, for a number of reasons:

1. Developer overhead - the more versions of the docs we offer, the more work we take on to keep documentation for supported versions up to date.
2. User overhead - the more versions we offer, the more users have to think about when they engage with our website.
3. Build performance - Docusaurus's build isn't fast. The more versions we add to our suite, the longer our build times become.

#### Updating the Site Version

These steps are based on Docusaurus's tutorial [here](https://docusaurus.io/docs/versioning#tutorials).

Note: generating the API documentation for the new "current" version will fail if the release branch for that version has not yet been created.

1. Run `npx --no-install docusaurus docs:version v<current-major-version-number>` from the root of this directory.
   E.g., `... docusaurus docs:version v2` when prepping for `v3` documentation.
    - This will copy the contents of `docs` into `versioned_docs` under the specified version ID.
    - This will also generate a sidebar configuration for the copied version under `versioned_sidebars`.
1. Update `config/docs-versions.mjs` to update the version ID for the "current" version, and add the newly frozen version to the `otherVersions` list.
   This will automatically update aspects of the site, including:
    1. Which versions of the API documentation are generated during the build
    1. The version selection drop-down in the site header

### Best practices

#### Markdown

##### Links

Generally, it is recommended to include file extensions in links when possible.
E.g., prefer `[foo](./foo.mdx)` over `[foo](./foo)`.

-   Docusaurus applies a different resolution strategy for relative _file path_ links than it does for URL links.
    See: <https://docusaurus.io/docs/markdown-features/links>

#### Assets

##### Images

When adding image assets for use in the website, please follow the instructions outlined [here](https://github.com/microsoft/FluidFramework/wiki/Uploading-images-for-the-website-to-Azure-blob-storage).
Namely, avoid adding binary files like images to the GitHub repo.
Instead, upload them to our Azure blob storage, and reference by URL.
E.g., <https://storage.fluidframework.com/static/images/website/brainstorm-example.png>

Images may only be uploaded by Microsoft Fluid team members.
If you do not have the appropriate permissions, but would like to contribute to our documentation, please reach out to us [here](https://github.com/microsoft/FluidFramework/issues/new/choose).

##### YouTube Videos

To meet our privacy requirements, it is important that we avoid embedding content that will collect cookies.
To ensure this, please never embed YouTube videos using their standard embed format.
Instead, be sure to leverage `https://www.youtube-nocookie.com/`.

To make this easy, we have a `YoutubeVideo` component under `@site/src/components/youtubeVideo` that can be used to embed a specified video ID using the correct settings.
Example:

```mdx
import { YoutubeVideo } from "@site/src/components/youtubeVideo";

...

<YoutubeVideo videoId="foo" className="my-styling" />
```

## Scripts

The following npm scripts are supported in this directory:

<!-- AUTO-GENERATED-CONTENT:START (PACKAGE_SCRIPTS:includeHeading=FALSE) -->

<!-- prettier-ignore-start -->
<!-- NOTE: This section is automatically generated using @fluid-tools/markdown-magic. Do not update these generated contents directly. -->

| Script | Description |
|--------|-------------|
| `build` | Build everything: the API documentation, the website, the tests, etc. |
| `build:api-documentation` | Download API model artifacts and generate API documentation. |
| `prebuild:docusaurus` | Runs pre-site build metadata generation. |
| `build:docusaurus` | Build the website with Docusaurus. |
| `build:generate-content` | Generate site content. Includes API documentation, as well as content generated / embedded by `markdown-magic`. |
| `build:markdown-magic` | Run `markdown-magic` to generate / embed contents in Markdown files. |
| `build:site` | Build the site, including API documentation. |
| `build:test` | TSC build of the test code as a sanity check. |
| `check-links` | Run link validation on the website. Requires the website to be running locally, either via `start` or `serve`. |
| `ci:check-links` | `check-links` variant for CI. Serves the site before running checks. |
| `clean` | Clean up generated artifacts (build output, etc.). |
| `clean:api-documentation` | Clean up generate API documentation content. |
| `clean:doc-models` | Clean up downloaded API model artifacts. |
| `clean:docusaurus` | Run Docusaurus's "clean". |
| `clean:test` | Clean up generated test output |
| `clean:versions-json` | Clean up generated `versions.json` file. |
| `download-doc-models` | Download API model artifacts published from our release branches. |
| `eslint` | Run `eslint`. |
| `eslint:fix` | Run `eslint` with auto-fix enabled. |
| `format` | Fix formatting issues with `prettier`. |
| `generate-api-documentation` | Generate API documentation from downloaded API model artifacts. |
| `generate-versions` | `dotenv -- node ./infra/generate-versions.mjs` |
| `lint` | Check for linter violations. |
| `lint:fix` | Auto-fix linter violations. |
| `preinstall` | Ensure developer is using `pnpm`. |
| `prettier` | Check for formatting issues with `prettier`. |
| `prettier:fix` | Fix formatting issues with `prettier`. |
| `rebuild` | Clean up existing generated artifacts and re-run the build. |
| `serve` | Serves the built website using Docusaurus. |
| `serve-with-azure-emulation` | Serves the built website using Docusaurus, including Azure service emulation for our Azure functions. |
| `prestart` | Runs pre-site build metadata generation. |
| `start` | Runs the website in watch mode with Docusaurus. |
| `pretest` | Install necessary `playwright` dependencies before running tests. |
| `test` | Run tests using `playwright` |

<!-- prettier-ignore-end -->

<!-- AUTO-GENERATED-CONTENT:END -->
