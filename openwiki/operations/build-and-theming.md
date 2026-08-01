# Operations, Theming & Build

## Local development

```sh
npm install
npm run dev       # vite dev server with HMR
npm run build     # vue-tsc -b type-check, then vite build (production bundle)
npm run preview   # serve the production build locally
```

There is no `lint` or `test` script defined in `package.json`.

## Testing status

**There is no automated test suite in this repository** — no `test` script, no `*.spec.ts` /
`*.test.ts` files, and no test runner (Vitest, Jest, etc.) configured anywhere in `package.json` or
`vite.config.ts`. The `build` script's `vue-tsc -b` step is the only automated check that runs
today, and it only catches type errors, not behavioral regressions.

**If you change scoring/lifecycle logic** (`ControlCenter.vue`'s handlers — see
[Scoring Workflow](../workflows/scoring-and-match-lifecycle.md)) or any ID-resolution computed
property, verify manually:
1. `npm run dev`, start a singles match, score a full game/set both ways (including a double fault
   and an unforced error), confirm score progression and server rotation are correct.
2. Repeat for doubles — specifically check that only the currently-serving A/B player can score
   Aces/Service Winners, and that a single button click only advances the score by one point (these
   are exactly the two issues recorded in `doubles-bugs-to-fix.md`; see below).
3. Reload the page mid-match to confirm `TennisMatch.load()` correctly resumes from `localStorage`.

If you add real tests, this page should be updated with the new command and where tests live.

## Doubles planning docs

Four root-level Markdown files were authored during the doubles-support effort captured in commit
`dc3938c` ("Major refactor: theme support, improved doubles support, improved stats, game
transcripts"):

- `doubles-technical-spec.md` — original design spec for the doubles data model.
- `doubles-update-plan.md` — implementation plan, including data shapes that predate the final
  `UnifiedMatchSummary` API (compare its example JSON against `src/types/tennis.ts` — they differ,
  so treat it as a planning artifact, not documentation of the shipped shape).
- `doubles-implementation-summary.md` — a checklist of what was implemented, written near the end of
  that effort.
- `doubles-bugs-to-fix.md` — two bugs identified during that work: (1) non-serving players able to
  score Aces/Service Winners, (2) points being double-counted in doubles.

**Current-code check**: as of this documentation pass, bug (1) appears resolved —
`ScorePlayer.vue` disables the Ace/Service Winner buttons via
`:disabled="!isSelectedPlayerServing || isMatchOver"`. Bug (2) was not independently reproduced;
if you're picking up doubles-related work, verify both bugs by hand-testing rather than trusting
the doc's "current behavior" section, since the code has clearly moved on since it was written.
Do not delete these docs without checking whether they still hold historical value for the project
owner; they are not part of the OpenWiki-generated docs and are out of scope for `openwiki/`
maintenance.

## Theming system

See [Architecture Overview: Theming](../architecture/overview.md#theming-usethemets--themeselectorvue)
for the technical mechanism. Operationally relevant points:

- Adding a new court theme requires updating: the `ThemeName` union + `applyTheme()`'s
  primary-color map in `useTheme.ts`, and the `<select>` options in `ThemeSelector.vue`. No changes
  to `custom.scss` are needed since it only reads the `--primary-color` CSS variable.
- Night mode overrides live entirely in `src/scss/custom.scss` under `[data-night="true"]` — extend
  that block for any new component that needs dark-mode-specific styling (cards, tables, forms, and
  the theme popup are already covered).
- Theme/night-mode preference persists via cookies (`tennisjs_theme`, `tennisjs_night`), separate
  from match state persistence (which is `localStorage`, inside `tennisjs`).

## OpenWiki CI workflow

`.github/workflows/openwiki-update.yml` runs the OpenWiki CLI on a daily schedule (and on manual
dispatch) to keep `openwiki/` current:

- Installs `openwiki` globally, runs `openwiki code --update --print`.
- Requires `OPENROUTER_API_KEY` secret (model access) and optionally `LANGSMITH_API_KEY` for tracing.
- Opens a PR (`openwiki/update` branch) touching `openwiki/`, `AGENTS.md`, `CLAUDE.md`, and the
  workflow file itself, rather than committing directly to the default branch.

## Security policy

`SECURITY.md` documents vulnerability reporting for all public `mattriffle` GitHub projects
(GitHub's private vulnerability reporting flow preferred, email fallback). Security/bugfix support
is generally limited to the latest minor version. This is a personal-project-wide policy, not
specific to `tennisjs-vue`'s internals.

## Dependency notes

- `tennisjs` is pinned to `^3.0.0` on npm (see `89f3248 "fix dependency"`, which reverted a
  temporary local `file:../tennisjs` path used during the `dc3938c` refactor while developing
  against an unreleased engine version). If match/scoring behavior seems inconsistent with these
  docs, first check the installed `tennisjs` version (`node_modules/tennisjs/package.json`) against
  what's described here — the UI code assumes the v2.2+/v3 unified API shape throughout.
- `pinia` and `mitt` are declared dependencies but currently unused in `src/` — see
  [Architecture Overview: state management](../architecture/overview.md#state-management-no-store-is-actually-used).
  Don't assume a store/event-bus pattern exists when tracing data flow.
