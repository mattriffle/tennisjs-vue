# Scoring & Match Lifecycle Workflow

All logic described here lives in `src/components/ControlCenter.vue` unless noted. This is the
canonical place to change match behavior in the UI layer.

## 1. Starting a match

- Before a match exists, `ControlCenter.vue` renders `NewGame.vue`.
- `NewGame.vue` collects match type (singles/doubles), player/team names, and number of sets (1/3/5,
  must be odd — `tennisjs` throws if given an even number), then emits `startNewGame` with a
  `GameData` payload (`src/types/tennis.ts`).
- `ControlCenter.handleStartNewGame(gameData)`:
  - Doubles: `new TennisMatch(gameData.team1, gameData.team2, gameData.selectedSets)` — team args are
    `[playerAName, playerBName]` tuples.
  - Singles: `new TennisMatch(gameData.player1, gameData.player2, gameData.selectedSets)`.
  - Immediately calls `match.getMatchSummary()` to populate `matchSummary` and sets `inGame = true`.
- On page load (`onMounted`), `ControlCenter` calls `TennisMatch.load()` first — if a match was
  in progress (persisted by `tennisjs` to `localStorage`), it resumes directly into the scoreboard
  instead of showing `NewGame`.

## 2. Resolving "who is serving" from the summary

Because `UnifiedMatchSummary.score.server.current` is a participant/player **ID string**, not a
simple `1`/`2` or `"A"`/`"B"`, several computed properties in `ControlCenter.vue` exist purely to
translate IDs back into UI-friendly team/position values:

- `currentServerTeam` — matches `serverId` against `participants[1].info.players.{a,b}.id` /
  `participants[2].info.players.{a,b}.id` for doubles; falls back to parsing a legacy `"1a"`-style ID
  if no match is found.
- `currentServerPosition` — same idea, but resolves to `"A"`/`"B"`.
- `isSinglesServer(playerNum)` — matches `serverId` against `participants[playerNum].info.id`, with
  legacy fallbacks for `serverId === "1"`/`"player1"` etc.

Any change to how servers are represented in `tennisjs` output requires updating all of these in
lockstep — they are the main integration-risk surface in this file.

## 3. Scoring a point

There are four distinct entry points depending on context, all converging on
`match.value.scorePoint(participant, outcome, scorerId?)`:

| UI action | Handler | Notes |
|---|---|---|
| Player/team clicks their own outcome button (Ace, Winner, etc.) | `handleScorePoint` (singles) / `handleScorePointDoubles` (doubles) | Singles resolves `playerId` from `participants[player].info.id`. Doubles resolves the specific A/B player's UUID from `participants[event.team].info.players[a\|b].id`, emitted by `ScorePlayer.vue`'s player-selector radio group. |
| Opponent's error attributed to this player ("Unforced" button) | `handleScoreOpponentUnforced` | The point winner is the **opponent**; the scorer/stat-attribution ID is the **player who erred**. `ScorePlayer.vue` already computes the opposing team number for doubles before emitting; for singles, `ControlCenter` derives the opponent from the `playerNumber` argument. |
| Double fault (two-step Fault → Double Fault button) | `handleDoubleFault` (in `ControlCenter`, triggered by `ScoreService.vue`'s `doubleFault` emit) | Determines the *receiving* side from the current server ID and scores `PointOutcome.DoubleFault` for them. `ScoreService.vue` itself only tracks a local `isFault` ref that requires two clicks before emitting. |

After every scoring call, `ControlCenter` re-fetches `matchSummary` and briefly flips `pointScored`
to `true` for 100ms — this is consumed by `ScoreService.vue`'s `watch` on the `pointScored` prop to
reset its local fault-tracking state (`isFault = false`) once a point has actually landed.

⚠️ **Historical bug context**: `doubles-bugs-to-fix.md` documents two now-apparently-fixed issues
from an earlier iteration of doubles support — non-serving players being able to score Aces, and
points being double-counted. Current code already gates serve-only buttons via
`ScorePlayer.vue`'s `isSelectedPlayerServing` computed (`:disabled="!isSelectedPlayerServing"`).
Treat that file as historical design notes, not a live bug tracker — see
[Operations: doubles planning docs](../operations/build-and-theming.md#doubles-planning-docs)
before assuming either bug is still present, and verify by hand-testing if picking up related work.

## 4. Undo

`GameControls.vue` emits `undoLastPoint` → `ControlCenter.handleUndoLastPoint` calls
`match.value.removePoint()` and refreshes the summary. Per the `tennisjs` type declarations,
statistics are **not** currently restored on undo — only score state rewinds. Keep this in mind if a
future change needs undo to also roll back stats.

## 5. Ending / restarting a match

- Match completion is driven entirely by the engine: once `summary.score.winner` (or legacy
  `summary.winner`) is set, `ControlCenter` renders `MatchWinner.vue` and `isMatchOver` becomes `true`,
  which disables all further scoring buttons across `ScorePlayer.vue`/`ScoreService.vue`.
- `GameControls.vue`'s "Start New Match" button requires a second click within 5 seconds
  (`confirmNewMatch` + `setTimeout`) before emitting `startNewMatch`, which resets `inGame`, `match`,
  and `matchSummary` to their initial empty state, returning the user to `NewGame.vue`.

## 6. Reviewing history: `MatchTranscript.vue`

Independent of the scoring flow above, `MatchTranscript.vue` renders `summary.setHistory` (completed
sets) plus `summary.currentSetGames` (the in-progress set) as a collapsible, sortable (asc/desc)
list of sets → games → points, using `summary.currentSet` to label the active set number and a
`formatOutcome()` helper to turn `PointSummary.outcome` enum values into readable labels (Ace,
Double Fault, Winner, Unforced Error, Forced Error, Service Winner, Point).
