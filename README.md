# Code Pilot Studio v2

A next-generation AI-powered IDE built with Tauri, React, and TypeScript.

## Architecture

This project uses a monorepo structure managed with pnpm workspaces and Turborepo.

### Project Structure

```
├── apps/
│   └── desktop/          # Tauri desktop application
├── packages/
│   ├── core/            # Core business logic
│   ├── ui/              # Shared UI components
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities
├── plugins/             # Plugin packages
└── tools/               # Build tools and scripts
```

## Prerequisites

- Node.js 18+
- pnpm 8+
- Rust (latest stable)
- Tauri CLI

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Build the application:
```bash
pnpm build
```

## Development

### Running the Desktop App

```bash
cd apps/desktop
pnpm tauri:dev
```

### Building for Production

```bash
cd apps/desktop
pnpm tauri:build
```

## Scripts

- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT