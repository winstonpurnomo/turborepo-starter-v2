#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { input, select } from "@inquirer/prompts";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectOptions {
  projectName: string;
  backend: "none" | "convex" | "trpc";
}

async function main() {
  // Parse CLI arguments
  const { values } = parseArgs({
    options: {
      name: { type: "string", short: "n" },
      backend: { type: "string", short: "b" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    showHelp();
    return;
  }

  // Interactive mode if no flags provided
  const projectName =
    values.name ||
    (await input({
      message: "Project name:",
      default: "my-app",
      validate: (value) => {
        if (!value) {
          return "Project name is required";
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return "Project name must be lowercase alphanumeric with hyphens";
        }
        return true;
      },
    }));

  const backend =
    values.backend ||
    (await select({
      message: "Select backend:",
      choices: [
        { name: "None (client-only)", value: "none" },
        { name: "Convex (realtime database)", value: "convex" },
        { name: "tRPC (typesafe API)", value: "trpc" },
      ],
      default: "none",
    }));

  // Validate backend value
  if (!["none", "convex", "trpc"].includes(backend)) {
    throw new Error(
      `Invalid backend: ${backend}. Must be one of: none, convex, trpc`
    );
  }

  console.log("\n📦 Generating project...\n");

  await generateProject({
    projectName,
    backend: backend as "none" | "convex" | "trpc",
  });

  console.log("\n✅ Project created successfully!\n");
  console.log("Next steps:");
  console.log(`  cd ${projectName}`);
  console.log("  pnpm install");
  console.log("  pnpm dev\n");
}

function showHelp() {
  console.log(`
🚀 Create TurboStart App - Interactive project generator

Usage:
  npx create-turbostart-app [options]
  pnpm create turbostart-app [options]

Options:
  -n, --name <name>       Project name (lowercase alphanumeric with hyphens)
  -b, --backend <type>    Backend type: none, convex, or trpc
  -h, --help             Show this help message

Examples:
  # Interactive mode
  npx create-turbostart-app

  # Non-interactive with flags
  npx create-turbostart-app --name my-app --backend convex
  npx create-turbostart-app -n my-trpc-app -b trpc
  `);
}

async function generateProject(options: ProjectOptions) {
  const { projectName, backend } = options;

  // Resolve template paths relative to the CLI package
  // In development: apps/cli/dist -> ../templates
  // In production: node_modules/create-turbostart-app/dist -> ../templates
  const templateRoot = path.resolve(__dirname, "../templates");
  const basePath = path.join(templateRoot, "base");
  const targetPath = path.resolve(process.cwd(), projectName);

  // Check if target directory exists
  if (await fs.pathExists(targetPath)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  // Copy base template
  console.log("📋 Copying base template...");
  await fs.copy(basePath, targetPath, {
    filter: (src) => {
      const relativePath = path.relative(basePath, src);
      // Skip build artifacts and local files
      if (relativePath.includes("node_modules")) return false;
      if (relativePath.includes(".turbo")) return false;
      if (relativePath.includes(".tanstack")) return false;
      if (relativePath.includes(".env.local")) return false;
      if (relativePath.includes("pnpm-lock.yaml")) return false;
      return true;
    },
  });

  // Apply backend template as overlay
  if (backend !== "none") {
    console.log(`📦 Adding ${backend} integration...`);
    await overlayTemplate(templateRoot, targetPath, backend);
  }

  // Update package.json with project name
  const pkgPath = path.join(targetPath, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // Create .env.local template
  await createEnvTemplate(targetPath, backend);
}

async function overlayTemplate(
  templateRoot: string,
  targetPath: string,
  templateName: string
) {
  const templatePath = path.join(templateRoot, templateName);

  if (!(await fs.pathExists(templatePath))) {
    console.warn(`⚠️  Template for ${templateName} not found, skipping...`);
    return;
  }

  // Walk through all files in the template and overlay them
  const files = await getAllFiles(templatePath);

  for (const file of files) {
    const relativePath = path.relative(templatePath, file);
    const targetFile = path.join(targetPath, relativePath);

    // Copy and override all files
    await fs.ensureDir(path.dirname(targetFile));
    await fs.copyFile(file, targetFile);
  }
}

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? getAllFiles(fullPath) : fullPath;
    })
  );
  return files.flat();
}

async function createEnvTemplate(
  targetPath: string,
  backend: "none" | "convex" | "trpc"
) {
  const envPath = path.join(targetPath, "apps/www/.env.example");
  const lines: string[] = [];

  lines.push("# Copy into .env.local");
  lines.push("");
  lines.push("# Your Sentry DSN (from your Sentry account)");
  lines.push("VITE_SENTRY_DSN=''");
  lines.push("");
  lines.push("# Your Sentry organization (from your Sentry account)");
  lines.push("VITE_SENTRY_ORG=''");
  lines.push("");
  lines.push("# Your Sentry project (from your Sentry account)");
  lines.push("VITE_SENTRY_PROJECT=''");
  lines.push("");
  lines.push("# Your Sentry authentication token (from your Sentry account)");
  lines.push("SENTRY_AUTH_TOKEN=''");
  lines.push("");
  lines.push("WORKOS_REDIRECT_URI=''");
  lines.push("WORKOS_API_KEY=''");
  lines.push("VITE_WORKOS_CLIENT_ID=''");
  lines.push("VITE_WORKOS_API_HOSTNAME=''");
  lines.push("WORKOS_COOKIE_PASSWORD=''");

  if (backend === "convex") {
    lines.push("");
    lines.push("# Convex");
    lines.push("VITE_CONVEX_URL=''");
  }

  if (backend === "trpc") {
    lines.push("");
    lines.push("# tRPC");
    lines.push("# No environment variables needed for tRPC");
  }

  await fs.writeFile(envPath, lines.join("\n"));
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
