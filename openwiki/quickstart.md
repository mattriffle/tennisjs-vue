# TennisJS Vue — Quickstart

## What this is

A Vue 3 single-page app that provides a **live tennis scorekeeping UI**. All match rules,
scoring math, and statistics are delegated to the external [`tennisjs`](https://github.com/mattriffle/tennisjs)
npm package (`^3.0.0` — see `package.json`); this repository is purely the **presentation and
interaction layer** on top of that engine. It runs at https://tennisjs.org.

- Framework: Vue 3 (`<script setup>` SFCs), TypeScript, Vite 7
- UI: Bootstrap 5 + Bootstrap Icons, custom SCSS theming
- State: local component refs (no Vuex/Pinia store is actually wired up, despite `pinia` being a
  dependency — see [Architecture Overview](architecture/overview.md))
- Persistence: browser `localStorage`, handled inside the `tennisjs` package itself via
  `TennisMatch.load()` / a save callback — this repo just calls those APIs.
- No test suite exists in this repo today (no `test` script in `package.json`, no `*.spec.ts`/`*.test.ts`
  files). See [Testing & Operations](operations/build-and-theming.md#testing-status).

## Where to start reading code

1. `src/main.ts` — app bootstrap, Bootstrap popover directive registration, global CSS imports.
2. `src/App.vue` — mounts `Header` + `ControlCenter`, loads the saved theme on mount.
3. `src/components/ControlCenter.vue` — the orchestrator. Owns match state (`TennisMatch` instance,
   `matchSummary`), decides which child component to show, and translates UI events into
   `tennisjs` API calls. Almost every "how does X work" question starts here.

## How the docs are organized

| Section | Purpose |
|---|---|
| [Architecture Overview](architecture/overview.md) | App shell, component tree, data flow, theming, persistence boundary with `tennisjs` |
| [Source Map](architecture/source-map.md) | File-by-file inventory of `src/` and config files |
| [Scoring & Match Lifecycle Workflow](workflows/scoring-and-match-lifecycle.md) | Step-by-step: starting a match, scoring points (singles/doubles), double faults, undo, match end |
| [Tennis Domain Concepts](domain/tennis-scoring-concepts.md) | Singles vs. doubles data shapes, unified vs. legacy `MatchSummary`, participant/player IDs, stats |
| [Operations, Theming & Build](operations/build-and-theming.md) | Dev/build commands, theming system, CI/OpenWiki workflow, known-issues doc status, testing gaps |

## Repository history in brief

- `f903f24` — Initial commit: singles-only scoreboard against an early `tennisjs` API.
- `bb14fff` — Pulled in a newer `tennisjs` release, fixed the logo.
- `d2f82cc` — Restyling pass; added double-fault to stats tracking.
- `24eaa9e` — Build error fixes (`tsconfig`, generated `vite.config.js`/`.d.ts` — these are stray
  build artifacts from `tsc`, not hand-written source; see [Source Map](architecture/source-map.md)).
- `dc3938c` **"Major refactor: theme support, improved doubles support, improved stats, game
  transcripts"** — the most significant commit in the repo's history. Introduced:
  - The unified `tennisjs` v2.2+/v3 API (`UnifiedMatchSummary`, participant-based IDs) alongside
    legacy type definitions kept for backward compatibility (`src/types/tennis.ts`).
  - Full doubles support (team-based scoring, per-player stats, server-position tracking).
  - `useTheme.ts` composable + `ThemeSelector.vue` (grass/clay/hard-court themes, night mode).
  - `MatchTranscript.vue` (point-by-point/game-by-game match history view).
  - Planning docs at the repo root (`doubles-technical-spec.md`, `doubles-implementation-summary.md`,
    `doubles-update-plan.md`, `doubles-bugs-to-fix.md`) that record the design and known issues from
    this effort — treat these as historical design notes, not live status (see
    [Operations](operations/build-and-theming.md#doubles-planning-docs)).
  - `89f3248` — Switched `tennisjs` dependency from a local `file:../tennisjs` path back to the
    published `^3.0.0` npm version.
  - `35a125f` (HEAD) — Added `SECURITY.md`.

For deeper "why" on any file, use `git log -p -- <path>` and `git blame` — the `dc3938c` commit is
the highest-signal commit for almost everything under `src/components/` and `src/types/`.
