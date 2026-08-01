# Architecture Overview

## The big picture

This app has exactly one meaningful architectural boundary: **UI (this repo) vs. match engine
(`tennisjs` npm package)**. Everything in `src/` is about rendering state and turning user clicks
into calls against a single `TennisMatch` instance; none of the scoring rules, tiebreak logic, or
statistics math live in this repository.

```
main.ts
  └─ App.vue                     (loads persisted theme on mount)
       ├─ Header.vue             (logo + Theme toggle button)
       │    └─ ThemeSelector.vue (teleported popup: court theme + night mode)
       └─ ControlCenter.vue      (orchestrator — see below)
            ├─ NewGame.vue           (shown before a match starts)
            ├─ ScoreBoard.vue        (shown during a match: score table)
            ├─ MatchWinner.vue       (shown once summary.score.winner is set)
            ├─ ScoreService.vue      (shows current server, Fault/Double Fault button)
            ├─ ScorePlayer.vue × 2   (one per player/team: Ace/Winner/Unforced/etc. buttons)
            ├─ GameControls.vue      (Undo Last Point, Start New Match)
            └─ MatchTranscript.vue   (collapsible point-by-point/game-by-game history)
```

## `ControlCenter.vue`: the orchestrator

`src/components/ControlCenter.vue` is the largest and most important file in the repo. It:

- Holds the single source of truth: `match` (a `TennisMatch` instance from `tennisjs`) and
  `matchSummary` (the plain-object snapshot returned by `match.getMatchSummary()`).
- Re-derives `matchSummary` after every mutating call (`scorePoint`, `removePoint`, etc.) — there is
  no reactive binding into the `TennisMatch` instance itself; the component re-reads a fresh summary
  each time and passes it down as props.
- Computes UI-facing derived state: `isDoubles`, `isMatchOver`, `currentServerTeam`,
  `currentServerPosition`, `isSinglesServer(playerNum)`, `team1Players`/`team2Players`. These exist
  because the `UnifiedMatchSummary` shape uses server/player **IDs** (UUID-like strings), not simple
  team/position labels, so the UI has to resolve "is this participant currently serving" by matching
  IDs — see [Domain Concepts](../domain/tennis-scoring-concepts.md) for the full data shape.
- Wires up every user action into a `tennisjs` API call — see
  [Scoring & Match Lifecycle Workflow](../workflows/scoring-and-match-lifecycle.md) for the full
  call-by-call breakdown.

On mount, it calls `TennisMatch.load()` (a static method inside the `tennisjs` package that reads
from `localStorage` by default) to resume an in-progress match if one exists.

## State management: no store is actually used

`pinia` and `mitt` are listed in `package.json` dependencies, but nothing in `src/` imports from
`pinia` or `mitt`. All state lives in `ref`s inside `ControlCenter.vue` and is passed down via
props/emitted back up via events (standard Vue parent-owns-state pattern). Do not assume a global
store exists when tracing data flow — start at `ControlCenter.vue`.

## Persistence boundary

Persistence (`localStorage`) is implemented **inside `tennisjs`**, not in this repo:

- `TennisMatch.load()` — static loader, defaults to reading from `localStorage`.
- `TennisMatch.fromJSON()` / `match.toJSON()` — (de)serialization of full match state.
- The `TennisMatch` constructor accepts an optional `saveCallback`; `tennisjs` also has a
  `defaultSaveCallback` that writes to `localStorage` automatically after each scoring mutation.

This repo never touches `localStorage` directly for match data — only `useTheme.ts` writes its own
cookies (`tennisjs_theme`, `tennisjs_night`) for UI preferences, which is a separate, simpler
mechanism (see below).

## Theming (`useTheme.ts` + `ThemeSelector.vue`)

`src/composables/useTheme.ts` is a **module-level singleton composable**: `theme` and `nightMode`
`ref`s are declared at module scope (not inside `useTheme()`), so every component that calls
`useTheme()` shares the same reactive state — this is how `App.vue` (loads theme on mount),
`Header.vue`/`ThemeSelector.vue` (theme picker UI), and `custom.scss` (`[data-night="true"]`
selectors) all stay in sync without a formal store.

- Theme choice (`grass` | `clay` | `hard-a` | `hard-b`) and night mode are persisted via cookies
  (`tennisjs_theme`, `tennisjs_night`, 1-year `max-age`), not `localStorage`.
- `applyTheme()` sets `data-theme`/`data-night` attributes on `<html>` and a `--primary-color` CSS
  variable, which `src/scss/custom.scss` consumes via `!important` overrides on Bootstrap's
  `.btn-primary`/`.bg-primary`/`.text-primary`/etc. classes and a dedicated night-mode block.
- `loadTheme()` includes a migration shim: a legacy cookie value of `"hard"` (pre-A/B split) is
  mapped to `"hard-a"`.

## Responsive behavior

`src/useIsMobile.ts` is a simple `window.innerWidth < 768` breakpoint composable used throughout
the components (`NewGame`, `GameControls`, `ScoreService`, `ScoreBoard`, `ScorePlayer`, `Header`) to
switch between stacked mobile layouts (`d-grid`) and table/row layouts on desktop. There is no CSS
media-query-only responsive design — layout branching happens in template `v-if`s driven by this
composable.

## Build tooling notes

- `vite.config.ts` registers `unplugin-vue-components` (auto-imports Vue SFCs as components without
  manual `import`) and a `@` → `src/` path alias.
- `vite.config.js` / `vite.config.d.ts` and `tsconfig.tsbuildinfo` are **generated build artifacts**
  checked into git (from `vue-tsc -b`/Vite's own compile step), not authored source. Ignore them when
  looking for configuration — the source of truth is `vite.config.ts`.
- `components.d.ts` is auto-generated by `unplugin-vue-components` for global component type
  declarations; do not hand-edit it.

See also: [Source Map](source-map.md) for a full file inventory.
