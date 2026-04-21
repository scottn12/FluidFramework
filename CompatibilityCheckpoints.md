# Fluid Framework Compatibility Checkpoints

This page lists all designated compatibility checkpoint releases for the Fluid Framework.
See the [Cross-Client Compatibility Policy](./CrossClientCompatibility.md#cross-client-compatibility-policy)
for how checkpoints define the compatibility window.

## Schedule

Checkpoints are designated on a **6-month cadence**. Any two clients whose checkpoint
releases are within **~18 months** of each other (spanning Checkpoint N through
Checkpoint N-3) are guaranteed to be cross-client compatible.

## Checkpoints

| Checkpoint | Release | Date | Compatible With |
|------------|---------|------|-----------------|
| CC-1 | 2.103.0 | 2026-06-26 | CC-1, all prior releases >= 2.0.0 (see note below) |
| CC-2 | TBD | ~2026-12 | CC-1 |
| CC-3 | TBD | ~2027-06 | CC-1, CC-2 |
| CC-4 | TBD | ~2027-12 | CC-1, CC-2, CC-3 |
| CC-5 | TBD | ~2028-06 | CC-2, CC-3, CC-4 |
| CC-6 | TBD | ~2028-12 | CC-3, CC-4, CC-5 |
| CC-7 | TBD | ~2029-06 | CC-4, CC-5, CC-6 |

> **Notes:**
>
> 1. **\*** Since `CC-1` is the first designated checkpoint, it is compatible with
>    all prior Fluid releases >= 2.0.0. Future checkpoints will define compatibility
>    relative to other checkpoints within the 18-month window.
> 2. Dates for future checkpoints are estimates based on the 6-month cadence and are
>    subject to change. Exact release versions and dates will be added as each
>    checkpoint is designated.
> 3. Customers are not required to run checkpoint releases. A client on a
>    non-checkpoint version inherits the compatibility guarantees of the nearest
>    checkpoint at or below its version. For example, let's say checkpoints were
>    designated at `2.100.0` and `2.200.0`. A client on version `2.150.0` would
>    inherit `2.100.0`'s compatibility window.
