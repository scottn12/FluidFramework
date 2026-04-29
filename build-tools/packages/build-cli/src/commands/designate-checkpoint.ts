/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getResolvedFluidRoot } from "@fluidframework/build-tools";
import { Flags } from "@oclif/core";
import chalk from "picocolors";
import * as semver from "semver";
import { BaseCommand } from "../library/commands/base.js";

/**
 * Represents a parsed checkpoint row from the CompatibilityCheckpoints.md table.
 */
interface CheckpointEntry {
	name: string;
	number: number;
	version: string;
	date: string;
	compatibleWith: string;
}

/**
 * Designates a new compatibility checkpoint release by updating the checkpoint table
 * in CompatibilityCheckpoints.md and printing guidance for additional manual updates.
 */
export default class DesignateCheckpointCommand extends BaseCommand<
	typeof DesignateCheckpointCommand
> {
	static readonly description =
		"Designate a new compatibility checkpoint release. Updates the checkpoint table " +
		"in CompatibilityCheckpoints.md and prints guidance for additional manual updates " +
		"needed across the codebase.";

	static readonly examples = [
		{
			description: "Designate CC-2 as a new checkpoint.",
			command:
				"<%= config.bin %> <%= command.id %> --name CC-2 --version 2.200.0 --date 2026-10-27",
		},
		{
			description: "Preview changes without writing files.",
			command:
				"<%= config.bin %> <%= command.id %> --name CC-3 --version 2.300.0 --date 2027-04-27 --dry-run",
		},
	];

	static readonly flags = {
		name: Flags.string({
			description: 'Checkpoint name (e.g., "CC-2"). Must match the pattern CC-<number>.',
			required: true,
		}),
		version: Flags.string({
			description:
				'Release version for the checkpoint (e.g., "2.200.0"). Must be valid semver.',
			required: true,
		}),
		date: Flags.string({
			description: "Release date in YYYY-MM-DD format.",
			required: true,
		}),
		"dry-run": Flags.boolean({
			description: "Preview changes without writing files.",
			default: false,
		}),
		...BaseCommand.flags,
	};

	public async run(): Promise<void> {
		const { flags } = this;
		const name = flags.name;
		const version = flags.version;
		const date = flags.date;
		const dryRun = flags["dry-run"];

		// --- Validation ---

		// Validate checkpoint name format
		const nameMatch = /^CC-(\d+)$/.exec(name);
		if (nameMatch === null) {
			this.error(
				`Invalid checkpoint name "${name}". Must match pattern CC-<number> (e.g., CC-2).`,
			);
		}
		const newNumber = Number.parseInt(nameMatch[1], 10);

		// Validate semver
		const parsed = semver.parse(version);
		if (parsed === null) {
			this.error(`Invalid version "${version}". Must be a valid semver string.`);
		}

		// Validate date format
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			this.error(`Invalid date "${date}". Must be in YYYY-MM-DD format.`);
		}
		// Also check the date is actually valid
		const dateObj = new Date(`${date}T00:00:00Z`);
		if (Number.isNaN(dateObj.getTime())) {
			this.error(`Invalid date "${date}". The date is not a valid calendar date.`);
		}

		// --- Read existing checkpoints ---

		const repoRoot = await getResolvedFluidRoot();
		const checkpointsPath = resolve(repoRoot, "CompatibilityCheckpoints.md");

		let fileContent: string;
		try {
			fileContent = await readFile(checkpointsPath, "utf8");
		} catch {
			this.error(
				`Could not read ${checkpointsPath}. Make sure you are running from within the Fluid Framework repo.`,
			);
		}

		const existingCheckpoints = parseCheckpointTable(fileContent);

		// Validate sequential numbering
		if (existingCheckpoints.length > 0) {
			const lastCheckpoint = existingCheckpoints[existingCheckpoints.length - 1];
			const expectedNumber = lastCheckpoint.number + 1;
			if (newNumber !== expectedNumber) {
				this.error(
					`Checkpoint number must be sequential. The last checkpoint is CC-${lastCheckpoint.number}, ` +
						`so the next must be CC-${expectedNumber}. Got CC-${newNumber}.`,
				);
			}

			// Validate version is greater than previous
			if (semver.lte(parsed, semver.parse(lastCheckpoint.version)!)) {
				this.error(
					`Version ${version} must be greater than the previous checkpoint version ` +
						`${lastCheckpoint.version}.`,
				);
			}
		} else if (newNumber !== 1) {
			this.error(
				`No existing checkpoints found. The first checkpoint must be CC-1, got CC-${newNumber}.`,
			);
		}

		// --- Compute "Compatible With" ---

		const compatibleWith = computeCompatibleWith(newNumber, existingCheckpoints);

		// --- Build new row ---

		const newRow = `| ${name} | ${version} | ${date} | ${compatibleWith} |`;

		this.log("");
		this.log(chalk.bold("New checkpoint row:"));
		this.log(`  ${newRow}`);
		this.log("");

		// --- Update the file ---

		if (dryRun) {
			this.log(chalk.yellow("Dry run: no files were modified."));
		} else {
			const updatedContent = insertCheckpointRow(fileContent, newRow);
			await writeFile(checkpointsPath, updatedContent, "utf8");
			this.log(chalk.green(`Updated ${checkpointsPath}`));
		}

		// --- Print guidance for manual updates ---

		this.log("");
		this.logHr();
		this.log(chalk.bold("Manual updates required:"));
		this.log("");
		this.log("The following files need manual updates to register the new checkpoint:\n");

		this.log(`  1. ${chalk.cyan("packages/framework/fluid-static/src/types.ts")}`);
		this.log(`     Add "${name}" to the CompatibilityMode type union.\n`);

		this.log(`  2. ${chalk.cyan("packages/framework/fluid-static/src/utils.ts")}`);
		this.log(`     Add a mapping for "${name}" in compatibilityModeToMinVersionForCollab.\n`);

		this.log(
			`  3. ${chalk.cyan("packages/framework/fluid-static/src/compatibilityConfiguration.ts")}`,
		);
		this.log(`     Add runtime options for "${name}" in compatibilityModeRuntimeOptions.\n`);

		this.log(`  4. ${chalk.cyan("packages/test/test-version-utils/src/compatConfig.ts")}`);
		this.log(`     Register "${name}" in the checkpoint registry.\n`);

		// Check if an old checkpoint aged out (N-3 is the oldest supported)
		const oldestSupported = newNumber - 3;
		if (oldestSupported > 1) {
			this.log(`  5. ${chalk.cyan("packages/framework/fluid-static/src/utils.ts")}`);
			this.log(
				`     Check if defaultMinVersionForCollab needs updating now that CC-${oldestSupported - 1} ` +
					`has aged out of the compatibility window.\n`,
			);
		}

		this.logHr();
	}
}

/**
 * Parses the checkpoint table from the CompatibilityCheckpoints.md content.
 * Returns an array of CheckpointEntry objects for each data row in the table.
 */
function parseCheckpointTable(content: string): CheckpointEntry[] {
	const entries: CheckpointEntry[] = [];
	const lines = content.split("\n");

	// Find the table header line
	let tableStartIndex = -1;
	for (let i = 0; i < lines.length; i++) {
		if (/^\|\s*Checkpoint\s*\|/.test(lines[i])) {
			tableStartIndex = i;
			break;
		}
	}

	if (tableStartIndex === -1) {
		return entries;
	}

	// Skip the header row and separator row
	const dataStartIndex = tableStartIndex + 2;

	for (let i = dataStartIndex; i < lines.length; i++) {
		const line = lines[i].trim();
		// Stop when we hit a non-table line
		if (!line.startsWith("|")) {
			break;
		}

		const cells = line
			.split("|")
			.map((cell) => cell.trim())
			.filter((cell) => cell.length > 0);

		if (cells.length < 4) {
			continue;
		}

		const checkpointName = cells[0];
		const match = /^CC-(\d+)$/.exec(checkpointName);
		if (match === null) {
			continue;
		}

		entries.push({
			name: checkpointName,
			number: Number.parseInt(match[1], 10),
			version: cells[1],
			date: cells[2],
			compatibleWith: cells[3],
		});
	}

	return entries;
}

/**
 * Computes the "Compatible With" string for a new checkpoint.
 * A checkpoint is compatible with itself and up to 3 prior checkpoints (N through N-3).
 */
function computeCompatibleWith(
	newNumber: number,
	existingCheckpoints: CheckpointEntry[],
): string {
	const oldest = Math.max(1, newNumber - 3);
	const names: string[] = [];
	for (let i = newNumber; i >= oldest; i--) {
		names.push(`CC-${i}`);
	}
	return names.join(", ");
}

/**
 * Inserts a new row into the checkpoint table in the file content.
 * The row is appended after the last table row.
 */
function insertCheckpointRow(content: string, newRow: string): string {
	const lines = content.split("\n");

	// Find the last table row
	let lastTableRowIndex = -1;
	let inTable = false;

	for (let i = 0; i < lines.length; i++) {
		if (/^\|\s*Checkpoint\s*\|/.test(lines[i])) {
			inTable = true;
			continue;
		}
		if (inTable) {
			if (lines[i].trim().startsWith("|")) {
				lastTableRowIndex = i;
			} else {
				break;
			}
		}
	}

	if (lastTableRowIndex === -1) {
		throw new Error("Could not find the checkpoint table in CompatibilityCheckpoints.md");
	}

	// Insert the new row after the last table row
	lines.splice(lastTableRowIndex + 1, 0, newRow);
	return lines.join("\n");
}
