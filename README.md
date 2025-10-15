# create-turbostart-app

Interactive CLI to scaffold TanStack Start applications with optional backend integrations.

## Features

- 🚀 **TanStack Start** - Full-stack React framework with SSR
- 🎨 **shadcn/ui** - Beautiful, accessible component library
- 🔐 **WorkOS Auth** - Enterprise-ready authentication (included by default)
- 📦 **Backend Options**:
  - **Convex** - Realtime database with type-safe queries
  - **tRPC** - End-to-end typesafe APIs
  - **None** - Client-only mode
- 🏗️ **Turborepo** - High-performance monorepo setup
- ⚡ **Vite** - Lightning-fast build tooling

## Quick Start

Create a new app with:

```bash
pnpm create turbostart-app
```

Or with npm:

```bash
npx create-turbostart-app
```

## Non-Interactive Usage

Skip the prompts by passing flags:

```bash
# Create app with Convex backend
pnpm create turbostart-app --name my-app --backend convex

# Create app with tRPC backend
pnpm create turbostart-app --name my-trpc-app --backend trpc

# Create client-only app
pnpm create turbostart-app --name my-app --backend none
```

## Project Structure

Generated projects follow this structure:

```
my-app/
├── apps/
│   └── www/              # TanStack Start application
│       ├── src/
│       │   ├── routes/   # File-based routing
│       │   └── components/
│       └── package.json
├── packages/
│   ├── ui/               # Shared UI components (shadcn/ui)
│   └── typescript-config/
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## Development

This repository contains the template generator CLI and base templates.

### Setup

```bash
# Install dependencies
pnpm install

# Build the CLI
cd apps/cli
pnpm build

# Generate test variants
pnpm test:variants
```

### Project Structure

```
.
├── apps/
│   └── cli/                      # CLI package
├── packages/
│   └── templates/
│       ├── base/                 # Base template (monorepo)
│       ├── convex/               # Convex addon overlay
│       └── trpc/                 # tRPC addon overlay
├── scripts/
│   └── generate-test-variants.sh # Test all template combinations
└── generated/                    # Test output (gitignored)
```

### Template Development Workflow

1. **Develop integration in base first**:
   ```bash
   cd packages/templates/base
   pnpm install
   pnpm dev
   # Add your integration, test it works
   ```

2. **Copy files to addon template**:
   ```bash
   # Copy modified files
   cp packages/templates/base/apps/www/src/routes/__root.tsx \
      packages/templates/convex/apps/www/src/routes/__root.tsx

   # Copy new files
   cp -r packages/templates/base/convex \
         packages/templates/convex/convex
   ```

3. **Test generation**:
   ```bash
   pnpm test:variants
   # Check generated/ directory
   ```

4. **Clean base back to minimal**:
   ```bash
   cd packages/templates/base
   git restore apps/www/src/routes/__root.tsx
   rm -rf convex/
   ```

### How Overlays Work

The CLI uses a simple overlay system:
1. Copy `base/` template to target directory
2. If backend selected, overlay `{backend}/` files on top
3. Files in addon templates **replace** matching files in base
4. New files are simply added

## Publishing

```bash
cd apps/cli
pnpm build
npm publish --access public
```

## License

MIT - see [LICENSE](./LICENSE) file
