# Fluid Framework Compatibility Checkpoints

This page lists all designated compatibility checkpoint releases for the Fluid Framework.
See the [Cross-Client Compatibility Policy](./CrossClientCompatibility.md#cross-client-compatibility-policy)
for how checkpoints define the compatibility window.

## Schedule

Checkpoints are designated on a **6-month cadence**. Any two clients whose checkpoint
releases are within **~18 months** of each other (spanning Checkpoint N through
Checkpoint N-3) are guaranteed to be cross-client compatible.

## Checkpoints

The **Release Range** column expresses the set of Fluid versions that fall under
each checkpoint.

| Checkpoint | Release Range | Earliest Date | Compatible With |
|------------|---------------|---------------|-----------------|
| CC-1 | `>=1.4.0 <2.0.0` | 2024-04-09 | CC-1, CC-2, CC-3, CC-4 |
| CC-2 | `>=2.0.0 <2.70.0` | 2024-06-26 | CC-1, CC-2, CC-3, CC-4, CC-5 |
| CC-3 | `>=2.70.0 <2.103.0` | 2025-10-28 | CC-1, CC-2, CC-3, CC-4, CC-5, CC-6 |
| CC-4 | `>=2.103.0 <TBD` | ~2026-06-06 | CC-1, CC-2, CC-3, CC-4, CC-5, CC-6, CC-7 |
| CC-5 | `TBD` | ~2026-12-06 | CC-2, CC-3, CC-4, CC-5, CC-6, CC-7, CC-8 |
| CC-6 | `TBD` | ~2027-06-06 | CC-3, CC-4, CC-5, CC-6, CC-7, CC-8, CC-9 |
| CC-7 | `TBD` | ~2027-12-06 | CC-4, CC-5, CC-6, CC-7, CC-8, CC-9, CC-10 |

> **Notes:**
>
> 1. `CC-1`, `CC-2`, and `CC-3` were designated retroactively based on existing
>    Fluid releases, which is why their release ranges are wider than the
>    6-month windows targeted for subsequent checkpoints. Starting with
>    `CC-4`, checkpoints follow the standard ~6-month cadence.
> 2. Dates and release ranges for future checkpoints are estimates and are
>    subject to change. Exact release versions and dates will be added as each
>    checkpoint is designated.
