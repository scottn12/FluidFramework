# Fluid Framework Compatibility Checkpoint Releases

This page lists all designated compatibility checkpoint releases for the Fluid Framework.
See the [Cross-Client Compatibility Policy](./CrossClientCompatibility.md#cross-client-compatibility-policy)
for how checkpoints define the compatibility window.

## Schedule

Checkpoints are designated on a cadence of **no less than 6 months**. Any two clients
whose checkpoint releases are within **18 months** of each other (spanning Checkpoint N
through Checkpoint N-3) are guaranteed to be cross-client compatible.

## Checkpoints

The **Release** column lists the Fluid release that designates the
checkpoint.

The **Range** column lists the semver range of Fluid releases that
fall under the checkpoint; every release in the range shares the same
cross-client compatibility guarantees as the first release.

<!-- prettier-ignore -->
| Checkpoint | Version Range | Earliest Date | Compatible Checkpoints | Compatible Semantic Versions |
| --- | --- | --- | --- | --- |
| CC-1 | `>=1.4.0 <2.0.0 \| 2.0.0-internal* \| 2.0.0-rc*` | 2024-04-09 | CC-1, CC-2, CC-3, CC-4 | `>=1.4.0 <2.140.0`(estimated)` \| 2.0.0-internal* \| 2.0.0-rc*` |
| CC-2 | `>=2.0.0 <2.60.0` | 2024-06-26 | CC-1, CC-2, CC-3, CC-4, CC-5 | `>=1.4.0 <2.180.0`(estimated)` \| 2.0.0-internal* \| 2.0.0-rc*` |
| CC-3 | `>=2.60.0 <2.100.0` | 2025-09-02 | CC-1, CC-2, CC-3, CC-4, CC-5, CC-6 | `>=1.4.0 <2.220.0`(estimated)` \| 2.0.0-internal* \| 2.0.0-rc*` |
| CC-4 | `>=2.100.0 <2.140.0` (limit TBD) | ~2026-04-27 | CC-1, CC-2, CC-3, CC-4, CC-5, CC-6, CC-7 | `>=1.4.0 <2.260.0`(estimated)` \| 2.0.0-internal* \| 2.0.0-rc*` |
| CC-5 (TBD) | `>=2.140.0 <2.180.0` | ~2026-12-07 | CC-2, CC-3, CC-4, CC-5, CC-6, CC-7, CC-8 | `>=2.0.0 <2.300.0`(estimated) |
| CC-6 (TBD) | `>=2.180.0 <2.220.0` | ~2027-07-19 | CC-3, CC-4, CC-5, CC-6, CC-7, CC-8, CC-9 | `>=2.70.0 <2.340.0`(estimated) |
| CC-7 (TBD) | `>=2.220.0 <2.260.0` | ~2028-02-28 | CC-4, CC-5, CC-6, CC-7, CC-8, CC-9, CC-10 | `>=2.100.0 <2.380.0`(estimated) |

> **Notes:**
>
> 1. `CC-1`, `CC-2`, and `CC-3` were designated retroactively based on existing
>    Fluid releases, which is why their release ranges are wider than the
>    6-month windows targeted for subsequent checkpoints. Starting with
>    `CC-4`, checkpoints follow the standard ~6-month cadence.
> 2. Dates and release ranges for future checkpoints are estimates and are
>    subject to change. Exact release versions and dates will be added as each
>    checkpoint is designated.
