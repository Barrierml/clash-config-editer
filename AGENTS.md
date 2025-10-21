# Project guidance

This project is a React + TypeScript single-page app that parses Clash / Clash.Meta YAML, lets the user curate proxy pools, and exports a cleaned configuration. The important modules are:

- `src/App.tsx` – orchestrates state for parsed nodes, proxy pools, runtime settings, and YAML generation.
- `src/lib/parser.ts` – parses the uploaded YAML into lightweight `ProxyNode` objects and collects warnings.
- `src/lib/utils.ts` – houses helpers for deduplicating nodes and rendering the Clash.Meta export payload.
- `src/components/*` – presentational widgets for uploading files, managing pools, and previewing the output.
- `src/types.ts` – central definitions for shared types and enums.

## Coding conventions

- Prefer functional React components with hooks; keep state updates immutable and isolated.
- Reuse utilities from `src/lib` instead of reimplementing parsing / YAML generation logic.
- Keep new runtime constants / helpers colocated with the types they describe (`src/types.ts`) or in `src/lib` if they are transformation utilities.
- When changing the config export pipeline, update both the sanitisation logic in `generateConfigYaml` and any UI affordances so they stay in sync.
- Do not introduce untyped values; extend `src/types.ts` when a new shape is needed.

## Feature-specific notes

- Proxy pools should only list leaf proxy names (no nested groups). `generateConfigYaml` sanitises groups by removing duplicates and renaming conflicts (e.g. prefixing with `POOL_`). Preserve that behaviour if you change the export format.
- Rules must stay aligned with the generated listeners; if you rename or remove a pool, make sure the associated rule fallback logic continues to resolve to a valid destination.
- Local storage persistence is keyed under `ccg:*`. When changing the stored shape, add a restore-time migration so old data does not break new expectations.

Follow these guidelines for every file in the repository unless a nested `AGENTS.md` states otherwise.
