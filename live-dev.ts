#!/usr/bin/env bun

import { watch } from "fs";
import { cp, mkdir, rm } from "fs/promises";
import { join } from "path";

const TEMPLATES_DIR = "./templates";
const GENERATED_DIR = "./_generated";
const VARIANTS = ["base", "convex", "trpc"] as const;

type Variant = (typeof VARIANTS)[number];

async function cleanGenerated() {
	console.log("🧹 Cleaning _generated directory...");
	try {
		await rm(GENERATED_DIR, { recursive: true, force: true });
	} catch (error) {
		// Ignore if doesn't exist
	}
}

async function generateVariant(variant: Variant) {
	const outputDir = join(GENERATED_DIR, variant);
	const baseDir = join(TEMPLATES_DIR, "base");
	const variantDir = join(TEMPLATES_DIR, variant);

	console.log(`📦 Generating ${variant}...`);

	// Create output directory
	await mkdir(outputDir, { recursive: true });

	// Copy base files first
	try {
		await cp(baseDir, outputDir, {
			recursive: true,
			force: true,
		});
	} catch (error) {
		console.error(`Error copying base for ${variant}:`, error);
	}

	// Overlay variant-specific files (if not base variant)
	if (variant !== "base") {
		try {
			await cp(variantDir, outputDir, {
				recursive: true,
				force: true,
			});
		} catch (error) {
			// Variant directory might not exist or be empty
			console.log(`No overlay files for ${variant}`);
		}
	}

	console.log(`✅ ${variant} generated`);
}

async function generateAll() {
	console.log("\n🚀 Generating all variants...\n");
	const startTime = Date.now();

	for (const variant of VARIANTS) {
		await generateVariant(variant);
	}

	const duration = Date.now() - startTime;
	console.log(`\n✨ All variants generated in ${duration}ms\n`);
}

async function startWatching() {
	console.log("👀 Watching templates directory for changes...\n");

	let debounceTimer: Timer | null = null;

	const watcher = watch(
		TEMPLATES_DIR,
		{ recursive: true },
		async (eventType, filename) => {
			if (!filename) return;

			console.log(`📝 Change detected: ${filename}`);

			// Debounce rapid file changes
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			debounceTimer = setTimeout(async () => {
				await generateAll();
				debounceTimer = null;
			}, 100);
		},
	);

	// Handle graceful shutdown
	process.on("SIGINT", () => {
		console.log("\n\n👋 Stopping watch mode...");
		watcher.close();
		process.exit(0);
	});
}

async function main() {
	console.log("🔥 Live Dev Mode\n");

	// Clean and generate initially
	await cleanGenerated();
	await generateAll();

	// Start watching for changes
	await startWatching();
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
