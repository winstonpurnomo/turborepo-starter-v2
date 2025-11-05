# create-turbostart-app

🚀 Create TurboStart App - A modern monorepo template with Bun and pnpm

## Quick Start

Create a new TurboStart project interactively:

```bash
pnpm create turbostart-app
```

Or specify options directly:

```bash
pnpm create turbostart-app --name my-app --backend convex
```

## Options

- `-n, --name <name>` - Project name (lowercase alphanumeric with hyphens)
- `-b, --backend <type>` - Backend type: `none`, `convex`, or `trpc` (default: `none`)
- `-h, --help` - Show help message

## Backend Options

### None (Client-only)
Pure frontend application with no backend integration.

### Convex
Includes Convex realtime database integration with type-safe API.

### tRPC
Includes tRPC for end-to-end typesafe API routes.

## After Creation

Go to the WorkOS dashboard and set up your project. You will need to copy the Client ID and API key from the dashboard. You will have to set up the redirects for your app. You will also have to configure the JWT template to include the `aud` claim with the value of your Client ID.

```bash
cd your-project-name
pnpm install
pnpm dev
```

## What's Included

- 🏗️ **Turborepo** - High-performance monorepo build system
- ⚡ **Vite** - Next generation frontend tooling
- ⚛️ **React** - Modern UI library
- 📦 **pnpm** - Fast, disk space efficient package manager
- 🎨 **UI Package** - Shared component library
- 🔧 **TypeScript** - Type safety throughout

## License

MIT
