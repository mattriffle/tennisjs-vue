# Tennis Domain Concepts

This page explains the data shapes and tennis-specific vocabulary used throughout the UI. The
authoritative type source for most of these is the `tennisjs` package itself
(`node_modules/tennisjs/dist/types.d.ts`); `src/types/tennis.ts` supplements it with UI-only and
backward-compat types.

## Singles vs. Doubles

The app supports both, selected at match creation (`NewGame.vue`). The two modes share almost all
components — `ControlCenter.vue` branches on `isDoublesMatch(matchSummary)` to decide which props to
pass into `ScorePlayer.vue`/`ScoreBoard.vue`/etc., rather than using separate component trees.

- **Singles**: two `participants` (1 and 2), each a single player (`info.type === "player"`).
- **Doubles**: two `participants` (1 and 2), each a team (`info.type === "team"`) with
  `info.players.a` / `info.players.b`, each `{ id, name }`. Positions are always labeled `"A"`/`"B"`
  within a team, independent of which team they're on.

There is no "mixed doubles" support in the UI despite `UnifiedMatchSummary.meta.matchType`
technically allowing `"mixed-doubles"` — `isDoublesMatch()` only checks for `"doubles"`, and
`NewGame.vue` only offers a Singles/Doubles toggle.

## Unified vs. Legacy match summary

`tennisjs` went through at least two API generations, and `src/types/tennis.ts` keeps both alive:

- **`UnifiedMatchSummary`** (current, v2.2+/v3 API) — the shape actually produced by
  `TennisMatch.getMatchSummary()` today. Participants are keyed by position (`1`/`2`), stats and
  server tracking use opaque **ID strings** (UUID-like) rather than positional labels. This is what
  every component in `src/components/` is written against.
- **`MatchSummary`** (legacy) — an older shape (`player1`/`player2`/`team1`/`team2` top-level keys,
  `meta.server` as `1 | 2`) kept only for the type guards `isLegacyMatchSummary()` and the
  `MatchSummaryUnion` type. There is no evidence any live code path still produces this shape from
  the current `tennisjs` version — treat `MatchSummary` as compatibility scaffolding, not an active
  data source, unless you find code that actually constructs one.
- Type guards `isUnifiedMatchSummary()` / `isLegacyMatchSummary()` exist to distinguish them
  structurally (presence of `participants` + `score.server.current`), but most components simply
  cast `props.summary` to `any` or `UnifiedMatchSummary` directly rather than calling these guards —
  be cautious about assuming defensive handling exists everywhere.

## Participant & player identity

Because scoring, stats, and server tracking all key off of **IDs** rather than positions:

- Every player (singles participant, or A/B within a doubles team) has a stable `info.id` /
  `info.players.{a,b}.id`.
- `match.scorePoint(participantPosition, outcome, scorerId?)` takes the **team/participant position**
  (`1` or `2`) as the point winner, plus an optional `scorerId` used for **individual stat
  attribution** — this is how a doubles team can win a point (`winner` = team number) while the
  stats get credited to the specific player who hit the shot or made the error (`scorerId` = that
  player's ID).
- This ID-matching pattern is why `ControlCenter.vue` has so many small ID-resolution computed
  properties (`currentServerTeam`, `currentServerPosition`, `isSinglesServer`) — see
  [Scoring Workflow](../workflows/scoring-and-match-lifecycle.md#2-resolving-who-is-serving-from-the-summary).
  Several of these include legacy-ID fallbacks (e.g. treating a server value of `"1"` or `"1a"` as
  meaningful) for extra robustness against older serialized match data.

## Point outcomes & stats categories

`PointOutcome` (imported from `tennisjs`) includes at least: `Ace`, `ServiceWinner`, `ReturnWinner`,
`Winner`, `UnforcedError`, `DoubleFault`, `Regular` — these map directly to the buttons in
`ScorePlayer.vue` ("Other" = `Regular`) and `ScoreService.vue` (Fault/Double Fault two-step).

Per-participant stats (`UnifiedPlayerStats` / the `stats` block on each `participants[n]`) are
grouped into three categories, consistently reflected in `ScoreBoard.vue`'s popover content and
`MatchTranscript.vue`'s outcome labels:

- **Serving**: aces, double faults, service winners, (optional) first-serve percentage
- **Returning**: return winners, break points won/played
- **Rally**: winners, unforced errors

For doubles, `teamData.stats.playerStats[playerId]` holds the same `UnifiedPlayerStats` shape
per-individual-player, in addition to team-level aggregate stats on `teamData.stats` itself.

## Match structure: sets → games → points

`summary.setHistory` is an array of completed `SetSummary` objects (each with a `games: GameSummary[]`);
the currently-in-progress set lives separately in `summary.currentSetGames` / `summary.currentSet`
(the set number). Each `GameSummary` has a `points: PointSummary[]` array and a `winner` (`1 | 2`).
`MatchTranscript.vue` is the only component that walks this full nested structure; everywhere else
only the top-level `score.sets` / `score.games` / `score.points` counts are used for display.
