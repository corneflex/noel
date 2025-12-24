# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application with Supabase integration. The project uses Rolldown (via `rolldown-vite`) as the bundler instead of the standard Vite bundler.

**Main application directory:** `noel/`

## Development Commands

All commands should be run from the `noel/` directory:

```bash
# Start development server with HMR
npm run dev

# Build for production (runs TypeScript compiler + Vite build)
npm run build

# Lint all files
npm run lint

# Preview production build locally
npm run preview
```

## Environment Variables

The project uses Supabase. Environment variables are defined in `.env` at the repository root:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/publishable key

These are prefixed with `VITE_` to be accessible in the client-side code.

## Project Structure

```
noel/
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── App.css           # App-specific styles
│   ├── index.css         # Global styles
│   └── assets/           # Static assets (SVGs, images)
├── public/               # Public static files served at root
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── eslint.config.js      # ESLint flat config
├── tsconfig.json         # TypeScript project references
├── tsconfig.app.json     # TypeScript config for app code
└── tsconfig.node.json    # TypeScript config for build tools
```

## TypeScript Configuration

The project uses TypeScript project references with three config files:
- `tsconfig.json` - Root config with references to app and node configs
- `tsconfig.app.json` - Strict configuration for application code (target: ES2022)
- `tsconfig.node.json` - Configuration for build tools and Vite config

Strict mode is enabled with additional checks:
- `noUnusedLocals`
- `noUnusedParameters`
- `noFallthroughCasesInSwitch`
- `noUncheckedSideEffectImports`
- `erasableSyntaxOnly`

## Build System

**Important:** This project uses `rolldown-vite@7.2.5` instead of standard Vite, configured via npm overrides in `package.json`. Rolldown is Vite's next-generation bundler that uses Rolldown/oxc for faster builds.

The build process:
1. TypeScript compilation (`tsc -b`)
2. Vite build with Rolldown bundler

## Linting

ESLint uses the new flat config format (`eslint.config.js`):
- Configured for TypeScript files (`**/*.{ts,tsx}`)
- Includes React Hooks rules
- Includes React Refresh rules for Vite HMR
- Ignores `dist/` directory

The README mentions optional stricter ESLint configurations available (type-checked rules, React-specific plugins) but these are not currently enabled.

## React Configuration

- React 19.2.0 with StrictMode enabled
- Uses `@vitejs/plugin-react` with Babel for Fast Refresh
- React Compiler is NOT enabled (per README, due to performance impact)
- JSX transform: `react-jsx` (automatic runtime)
