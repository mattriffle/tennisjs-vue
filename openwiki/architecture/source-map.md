# Source Map

Reference inventory of the repository. For narrative architecture, see
[Architecture Overview](overview.md).

## Entry points & app shell

| File | Purpose |
|---|---|
| `index.html` | Vite HTML entry, mounts `#app` |
| `src/main.ts` | Creates the Vue app, registers global Bootstrap `v-popover` directive, imports Bootstrap CSS/icons, `custom.scss`, `assets/main.css` |
| `src/App.vue` | Root component: renders `Header` + `ControlCenter`, loads persisted theme `onMounted` |
| `src/vite-env.d.ts` | Vite/Vue TS ambient type declarations |

## Components (`src/components/`)

| File | Purpose |
|---|---|
| `Header.vue` | Logo + "Theme" toggle link; hosts `ThemeSelector` |
| `ThemeSelector.vue` | Teleported popup for choosing court theme + night mode toggle |
| `ControlCenter.vue` | Match orchestrator: owns `TennisMatch` instance & summary, renders the right child components, translates events into `tennisjs` API calls. See [Architecture Overview](overview.md#controlcentervue-the-orchestrator) and [Scoring Workflow](../workflows/scoring-and-match-lifecycle.md) |
| `NewGame.vue` | Pre-match form: match type toggle (singles/doubles), player/team name inputs, number of sets (1/3/5), emits `startNewGame` |
| `ScoreBoard.vue` | Renders the score table (sets/games/points) for singles or doubles, stats popovers per player/team, current-server indicator (🎾) |
| `ScorePlayer.vue` | Per-player/team scoring button panel (Ace, Service Winner, Return Winner, Winner, Unforced, Other/Regular); in doubles, includes an A/B player selector and gates serve-only buttons by `isSelectedPlayerServing` |
| `ScoreService.vue` | Shows "Service: <name>" and the Fault → Double Fault two-step button |
| `GameControls.vue` | Undo Last Point / Start New Match (with a 5-second "press again to confirm" guard) buttons |
| `MatchWinner.vue` | Winner banner shown once `summary.score.winner` (or legacy `summary.winner`) is set |
| `MatchTranscript.vue` | Collapsible, sortable (asc/desc) point-by-point and game-by-game match history, built from `summary.setHistory` / `summary.currentSetGames` |

## Composables & utilities (`src/composables/`, `src/*.ts`)

| File | Purpose |
|---|---|
| `composables/useTheme.ts` | Module-singleton theme/night-mode state, cookie persistence, DOM attribute/CSS variable application |
| `useIsMobile.ts` | `window.innerWidth < 768` reactive breakpoint used for responsive layout branching |

## Types (`src/types/`)

| File | Purpose |
|---|---|
| `types/tennis.ts` | UI-facing type definitions: `UnifiedMatchSummary`/`UnifiedPlayerStats` (current API shape), legacy `MatchSummary`/`PlayerScore`/`DoublesTeam`/`PlayerStats` (backward-compat shape), `GameData`/`DoublesScoreEvent` (UI event payloads), and type guards `isDoublesMatch`/`isSinglesMatch`/`isUnifiedMatchSummary`/`isLegacyMatchSummary`. See [Domain Concepts](../domain/tennis-scoring-concepts.md). |

Note: most match/point/stat types actually used at runtime (`UnifiedMatchSummary`, `PointOutcome`,
`ParticipantPosition`, `GameSummary`, `SetSummary`, `PointSummary`) are imported directly from the
`tennisjs` package, not from `types/tennis.ts`. `types/tennis.ts` supplements those with
UI-only/legacy types.

## Styling & assets

| File | Purpose |
|---|---|
| `src/scss/custom.scss` | Bootstrap import + `--primary-color` CSS variable overrides driven by theme; `[data-night="true"]` dark-mode overrides for cards, tables, forms, theme popup |
| `src/style.css` | Vite scaffold default styles |
| `src/assets/main.css` | Additional global CSS imported in `main.ts` |
| `src/assets/tennisjs.png` | Logo used in `Header.vue` and `README.md` |
| `public/favicon.ico` | Favicon |

## Config & build

| File | Purpose |
|---|---|
| `package.json` | Scripts (`dev`, `build`, `preview`), dependencies (`tennisjs`, `bootstrap`, `vue`, `pinia`/`mitt` — currently unused, see [Architecture Overview](overview.md#state-management-no-store-is-actually-used)) |
| `vite.config.ts` | Vite config: Vue plugin, `unplugin-vue-components` auto-import, `@` → `src/` alias |
| `vite.config.js` / `vite.config.d.ts` | **Generated** compiled artifacts of the above — not hand-edited |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | TypeScript project references (app vs. Node/tooling scope) |
| `tsconfig.tsbuildinfo` | Generated incremental build cache |
| `components.d.ts` | Auto-generated global component type declarations (`unplugin-vue-components`) |
| `.vscode/extensions.json` | Recommended VS Code extensions |
| `.github/workflows/openwiki-update.yml` | Scheduled OpenWiki doc-update workflow (see [Operations](../operations/build-and-theming.md#openwiki-ci-workflow)) |

## Root-level planning/status docs

These are historical design/status notes from the doubles-support effort (commit `dc3938c`), kept
at the repo root, not under `openwiki/`:

- `doubles-technical-spec.md`
- `doubles-implementation-summary.md`
- `doubles-update-plan.md`
- `doubles-bugs-to-fix.md`

See [Operations: doubles planning docs](../operations/build-and-theming.md#doubles-planning-docs)
for how to interpret these relative to current code.

## Other root docs

- `README.md` — install/dev/build commands, live URL, license
- `SECURITY.md` — vulnerability reporting policy for `mattriffle` GitHub projects
- `AGENTS.md` / `CLAUDE.md` — pointer to OpenWiki docs for agent tooling (not hand-edited by OpenWiki runs)
