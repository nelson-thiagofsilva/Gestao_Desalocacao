# Agent Instructions for Gestao_Desalocacao

## Purpose
This file helps AI coding agents understand the repository, its structure, and the most useful entry points for development tasks.

## Project overview
- Frontend-only Vite React application using TypeScript/TSX.
- Main entry: `src/main.tsx`.
- App shell: `src/app/App.tsx`.
- Primary UI and feature components: `src/app/components/`.
- Application logic and utilities: `src/app/hooks/` and `src/app/utils/`.
- Styling: `src/styles/` plus Tailwind CSS and custom theme files.
- Data format and usage is documented in `INSTRUCOES.md`.
- Example input files are in root: `exemplo-dados*.csv`, `exemplo-dados*.txt`.

## Build and run
- Install dependencies: `pnpm install` (or `npm install` if pnpm is unavailable).
- Start dev server: `npm run dev`.
- Build for production: `npm run build`.

## Key patterns and conventions
- UI uses Vite + React + Tailwind CSS, with Radix UI components and `@mui/material` icons.
- The app loads and processes client-side CSV/TXT data only; there is no backend service.
- Data parsing should support TAB, comma, and semicolon separators.
- `src/app/components/PreVendasTable.tsx` is the pre-vendas (pre-sales) table component and is relevant for tasks involving table sorting or display.
- Preserve existing CSS and layout patterns when editing components; the app uses utility-driven styling and custom theme overrides.

## Important documentation
- `README.md` describes the repo and run commands.
- `INSTRUCOES.md` explains accepted data formats, required columns, and app behavior.

## Notes for AI agents
- There are no test or lint scripts defined in `package.json`.
- Prefer small, targeted changes that keep UI behavior and data parsing consistent.
- If you need to understand data shape, consult `INSTRUCOES.md` before modifying parsing or table logic.
- If the repository has duplicate package metadata under `src/app/components/package.json`, treat the root package as the primary source.
