#!/usr/bin/env node
/** biome-ignore-all lint/performance/noNamespaceImport: recommended */
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import * as p from "@clack/prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Backend = "none" | "convex" | "trpc";

interface ProjectOptions {
  projectName: string;
  backend: Backend;
}

function showHelp() {
  console.log(`
🚀 Create TurboStart App

Usage:
  pnpm create turbostart-app [options]

Options:
  -n, --name <name>       Project name (lowercase alphanumeric with hyphens)
  -b, --backend <type>    Backend type: none, convex, or trpc (default: none)
  -h, --help              Show this help message

Examples:
  # Interactive mode
  pnpm create turbostart-app

  # Non-interactive with flags
  pnpm create turbostart-app --name my-app --backend convex
  pnpm create turbostart-app -n my-trpc-app -b trpc
`);
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      name: { type: "string", short: "n" },
      backend: { type: "string", short: "b" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: false,
  });

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  p.intro("🚀 Create TurboStart App");

  let projectName = values.name;
  let backend = values.backend as Backend | undefined;

  // Interactive prompts if flags not provided
  if (!projectName) {
    projectName = (await p.text({
      message: "Project name:",
      placeholder: "my-app",
      defaultValue: "my-app",
      validate: (value) => {
        if (!value) return "Project name is required";
        if (!/^[a-z0-9-]+$/.test(value))
          return "Project name must be lowercase alphanumeric with hyphens";
      },
    })) as string;

    if (p.isCancel(projectName)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
  }

  if (!backend) {
    backend = (await p.select({
      message: "Select backend:",
      options: [
        { value: "none", label: "None (client-only)" },
        { value: "convex", label: "Convex (realtime database)" },
        { value: "trpc", label: "tRPC (typesafe API)" },
      ],
    })) as Backend;

    if (p.isCancel(backend)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
  }

  if (!/^[a-z0-9-]+$/.test(projectName)) {
    p.cancel("Project name must be lowercase alphanumeric with hyphens");
    process.exit(1);
  }

  const s = p.spinner();
  s.start("Generating project");

  await generateProject({ projectName, backend });

  s.stop("Project created successfully!");

  p.outro(`Next steps:
  cd ${projectName}
  pnpm install
  pnpm dev`);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

async function generateProject({ projectName, backend }: ProjectOptions) {
  // Templates are at the package root
  // When running from dist/index.js: __dirname is dist/, so ../templates works
  // When running from index.ts (dev/test): __dirname is root, so ./templates works
  const templateRoot = __dirname.endsWith('dist')
    ? resolve(__dirname, "../templates")
    : resolve(__dirname, "./templates");
  const basePath = join(templateRoot, "base");
  const targetPath = resolve(process.cwd(), projectName);

  // Check for existing directory
  try {
    const stats = await stat(targetPath);
    if (stats.isDirectory()) throw new Error(`Directory ${projectName} exists`);
  } catch {
    // directory missing → OK
  }

  console.log("📋 Copying base template...");
  await copyDir(basePath, targetPath, (rel) => {
    if (
      rel.includes("node_modules") ||
      rel.includes(".turbo") ||
      rel.includes(".tanstack") ||
      rel.includes(".env.local") ||
      rel.includes("pnpm-lock.yaml")
    )
      return false;
    return true;
  });

  if (backend !== "none") {
    console.log(`📦 Adding ${backend} integration...`);
    await overlayTemplate(templateRoot, targetPath, backend);
  }

  // Update package.json with project name
  const pkgPath = join(targetPath, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  pkg.name = projectName;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));

  await createEnvTemplate(targetPath, backend);
}

async function copyDir(
  src: string,
  dest: string,
  filter?: (relativePath: string) => boolean
) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    const rel = relative(src, srcPath);

    if (filter && !filter(rel)) continue;

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, filter);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function overlayTemplate(
  root: string,
  target: string,
  templateName: string
) {
  const templatePath = join(root, templateName);
  try {
    await stat(templatePath);
  } catch {
    console.warn(`⚠️  Template for ${templateName} not found, skipping...`);
    return;
  }

  await copyDir(templatePath, target);
}

async function createEnvTemplate(targetPath: string, backend: Backend) {
  const envPath = join(targetPath, "apps/www/.env.example");

  const lines = [
    "# Copy into .env.local",
    "",
    "# Your Sentry DSN (from your Sentry account)",
    "VITE_SENTRY_DSN=''",
    "",
    "# Your Sentry organization (from your Sentry account)",
    "VITE_SENTRY_ORG=''",
    "",
    "# Your Sentry project (from your Sentry account)",
    "VITE_SENTRY_PROJECT=''",
    "",
    "# Your Sentry authentication token (from your Sentry account)",
    "SENTRY_AUTH_TOKEN=''",
    "",
    "WORKOS_REDIRECT_URI=''",
    "WORKOS_API_KEY=''",
    "WORKOS_CLIENT_ID=''",
    "VITE_WORKOS_API_HOSTNAME=''",
    "WORKOS_COOKIE_PASSWORD=''",
  ];

  if (backend === "convex") {
    lines.push(
      "",
      "# Convex",
      "",
      "VITE_CONVEX_DEPLOYMENT=''",
      "",
      "VITE_CONVEX_URL=''"
    );
  }
  if (backend === "trpc") {
    lines.push("", "# tRPC", "# No environment variables needed for tRPC");
  }

  await writeFile(envPath, lines.join("\n"));
}
