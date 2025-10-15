#!/bin/bash

# Generate all template variants for testing
# Run from repo root: ./scripts/generate-test-variants.sh
# Or from apps/cli: ../../scripts/generate-test-variants.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GENERATED_DIR="$REPO_ROOT/generated"

echo "🧪 Generating test variants..."
echo "Repository root: $REPO_ROOT"
echo ""

# Clean up existing generated directory
if [ -d "$GENERATED_DIR" ]; then
  echo "🗑️  Cleaning up existing generated/ directory..."
  rm -rf "$GENERATED_DIR"
fi

mkdir -p "$GENERATED_DIR"
cd "$GENERATED_DIR"

# Build the CLI first
echo "🔨 Building CLI..."
cd "$REPO_ROOT/apps/cli"
pnpm build

# Use the built CLI
CLI="node $REPO_ROOT/apps/cli/dist/index.js"

# Generate all variants
cd "$GENERATED_DIR"

echo ""
echo "📦 Generating variant: base (no backend)..."
$CLI --name base --backend none

echo ""
echo "📦 Generating variant: base-convex..."
$CLI --name base-convex --backend convex

echo ""
echo "📦 Generating variant: base-trpc..."
$CLI --name base-trpc --backend trpc

echo ""
echo "✅ All variants generated successfully!"
echo ""
echo "Generated projects:"
ls -1 "$GENERATED_DIR"
echo ""
echo "To test a variant:"
echo "  cd generated/base-convex"
echo "  pnpm install"
echo "  pnpm dev"
