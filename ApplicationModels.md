# Fluid Framework Application Models

> **Work in progress.** This document is a placeholder. Content describing the differences between the encapsulated and declarative application models will be added here.

## Overview

Fluid Framework supports two application models for hosting collaborative content:

- **Declarative Model** — The application uses a service client (e.g., `AzureClient`, `OdspClient`) to create or load containers. Configuration — including cross-client compatibility — is supplied at the service-client level via parameters such as `CompatibilityMode`.
- **Encapsulated Model** — The application calls `loadContainerRuntime` directly to construct a container runtime. Configuration — including `minVersionForCollab` — is supplied on `LoadContainerRuntimeParams`.
