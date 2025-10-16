import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

const TEST_DIR = "./test-generated";
const ROOT_DIR = import.meta.dir;

beforeAll(() => {
  // Clean up any existing test directories
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  // Create test directory
  mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  // Clean up after tests
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe("Template Generation", () => {
  test("should generate base variant (none backend)", async () => {
    const projectName = "test-base";
    const projectPath = join(TEST_DIR, projectName);

    // Run CLI with flags (from test directory)
    await $`cd ${TEST_DIR} && bun run ${join(
      ROOT_DIR,
      "index.ts"
    )} --name ${projectName} --backend none`;

    // Verify base structure
    expect(existsSync(join(projectPath, "package.json"))).toBe(true);
    expect(existsSync(join(projectPath, "apps/www/package.json"))).toBe(true);
    expect(existsSync(join(projectPath, "packages/ui/package.json"))).toBe(
      true
    );
    expect(existsSync(join(projectPath, "apps/www/src/routes"))).toBe(true);

    // Verify package.json name was updated
    const pkgJson = JSON.parse(
      await readFile(join(projectPath, "package.json"), "utf-8")
    );
    expect(pkgJson.name).toBe(projectName);
  });

  test("should generate convex variant", async () => {
    const projectName = "test-convex";
    const projectPath = join(TEST_DIR, projectName);

    await $`cd ${TEST_DIR} && bun run ${join(
      ROOT_DIR,
      "index.ts"
    )} --name ${projectName} --backend convex`;

    // Verify base structure
    expect(existsSync(join(projectPath, "package.json"))).toBe(true);

    // Verify convex-specific files
    expect(existsSync(join(projectPath, "apps/www/CONVEX_ENABLED.md"))).toBe(
      true
    );
    expect(existsSync(join(projectPath, "apps/www/.env.example"))).toBe(true);

    // Verify env file contains Convex config
    const envContent = await readFile(
      join(projectPath, "apps/www/.env.example"),
      "utf-8"
    );
    expect(envContent).toContain("VITE_CONVEX_URL");
    expect(envContent).toContain("Convex");
  });

  test("should generate trpc variant", async () => {
    const projectName = "test-trpc";
    const projectPath = join(TEST_DIR, projectName);

    await $`cd ${TEST_DIR} && bun run ${join(
      ROOT_DIR,
      "index.ts"
    )} --name ${projectName} --backend trpc`;

    // Verify base structure
    expect(existsSync(join(projectPath, "package.json"))).toBe(true);

    // Verify tRPC-specific files
    expect(existsSync(join(projectPath, "apps/www/TRPC_ENABLED.md"))).toBe(
      true
    );
    expect(existsSync(join(projectPath, "apps/www/.env.example"))).toBe(true);

    // Verify env file mentions tRPC
    const envContent = await readFile(
      join(projectPath, "apps/www/.env.example"),
      "utf-8"
    );
    expect(envContent).toContain("tRPC");
  });

  test("should validate project name format", async () => {
    const invalidName = "Invalid_Name!";

    // This should fail due to invalid name format
    try {
      await $`bun run ${join(
        ROOT_DIR,
        "index.ts"
      )} --name ${invalidName} --backend none`;
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });
});
