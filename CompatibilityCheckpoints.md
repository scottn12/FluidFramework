# Fluid Framework Compatibility Checkpoints

This page lists all designated compatibility checkpoint releases for the Fluid Framework.
See the [Cross-Client Compatibility Policy](./CrossClientCompatibility.md#cross-client-compatibility-policy)
for how checkpoints define the compatibility window.

## Schedule

Checkpoints are designated on a **6-month cadence**. Any two clients whose checkpoint
releases are within **18 months** of each other (up to 3 checkpoints apart) are
guaranteed to be cross-client compatible.

## Checkpoints

| Checkpoint | Release | Date | Compatible With |
|------------|---------|------|-----------------|
| CC-1 | 2.100.0 | 2026-04-27 | CC-1, all prior releases >= 2.0.0* |

> **\*Note:** Since `CC-1` is the first designated checkpoint, it is
> compatible with all prior Fluid releases >= 2.0.0. Future checkpoints will define
> compatibility relative to other checkpoints within the 18-month window.
