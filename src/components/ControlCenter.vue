<template>
  <div>
    <NewGame v-if="!inGame" @startNewGame="handleStartNewGame" />
    <ScoreBoard :summary="matchSummary" v-if="inGame" />
    <MatchWinner
      :summary="matchSummary"
      v-if="(matchSummary as any)?.score?.winner"
    />
    <ScoreService
      :pointScored="pointScored"
      :isMatchOver="isMatchOver"
      :summary="matchSummary"
      @doubleFault="handleDoubleFault"
      v-if="inGame"
    />
    <div class="player-cards-container" v-if="inGame">
      <div class="row">
        <!-- Singles Mode -->
        <template v-if="!isDoubles">
          <div class="col" v-if="matchSummary">
            <ScorePlayer
              :playerName="(matchSummary as any).participants[1].info.name"
              :isServing="isSinglesServer(1)"
              :isMatchOver="isMatchOver"
              :isDoubles="false"
              @scorePoint="handleScorePoint(1, $event)"
              @scoreOpponentUnforced="
                (event) => handleScoreOpponentUnforced(event, 1)
              "
            />
          </div>
          <div class="col" v-if="matchSummary">
            <ScorePlayer
              :playerName="(matchSummary as any).participants[2].info.name"
              :isServing="isSinglesServer(2)"
              :isMatchOver="isMatchOver"
              :isDoubles="false"
              @scorePoint="handleScorePoint(2, $event)"
              @scoreOpponentUnforced="
                (event) => handleScoreOpponentUnforced(event, 2)
              "
            />
          </div>
        </template>

        <!-- Doubles Mode -->
        <template v-else>
          <div class="col" v-if="matchSummary">
            <ScorePlayer
              :teamName="`Team 1`"
              :teamNumber="1"
              :isServing="currentServerTeam === 1"
              :currentServerPosition="
                currentServerTeam === 1 ? currentServerPosition : null
              "
              :isMatchOver="isMatchOver"
              :isDoubles="true"
              :players="team1Players"
              @scorePointDoubles="handleScorePointDoubles"
              @scoreOpponentUnforced="handleScoreOpponentUnforced"
            />
          </div>
          <div class="col" v-if="matchSummary">
            <ScorePlayer
              :teamName="`Team 2`"
              :teamNumber="2"
              :isServing="currentServerTeam === 2"
              :currentServerPosition="
                currentServerTeam === 2 ? currentServerPosition : null
              "
              :isMatchOver="isMatchOver"
              :isDoubles="true"
              :players="team2Players"
              @scorePointDoubles="handleScorePointDoubles"
              @scoreOpponentUnforced="handleScoreOpponentUnforced"
            />
          </div>
        </template>
      </div>
    </div>
    <GameControls
      @undoLastPoint="handleUndoLastPoint"
      @startNewMatch="handleStartNewMatch"
      v-if="inGame"
    />
    <div class="player-cards-container">
      <MatchTranscript :summary="matchSummary" v-if="inGame && matchSummary" />
    </div>

    <div class="text-center text-muted mt-2" v-if="inGame">
      Copyright 2023-{{ new Date().getFullYear() }} Matt Riffle. Available Under
      The MIT License
      <p />
      <a
        href="https://github.com/mattriffle/tennisjs-vue"
        target="_blank"
        class="btn btn-outline-primary"
        >View On <i class="bi-github"></i>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import NewGame from "./NewGame.vue";
import ScoreBoard from "./ScoreBoard.vue";
import MatchWinner from "./MatchWinner.vue";
import ScoreService from "./ScoreService.vue";
import ScorePlayer from "./ScorePlayer.vue";
import GameControls from "./GameControls.vue";
import MatchTranscript from "./MatchTranscript.vue";
import { ref, onMounted, computed } from "vue";
import {
  TennisMatch,
  PointOutcome,
  type ParticipantPosition,
  type UnifiedMatchSummary,
} from "tennisjs";
import {
  isDoublesMatch,
  isUnifiedMatchSummary,
  isLegacyMatchSummary,
  type GameData,
  type DoublesScoreEvent,
  type MatchSummaryUnion,
} from "../types/tennis";

const inGame = ref(false);
const match = ref<TennisMatch | null>(null);
const matchSummary = ref<MatchSummaryUnion | any>(null);
const pointScored = ref(false);

const isMatchOver = computed(() => {
  if (!matchSummary.value) return false;
  const summary = matchSummary.value as any;
  return !!(summary.score?.winner || summary.winner);
});
const isDoubles = computed(() => isDoublesMatch(matchSummary.value));

// Computed properties for doubles
const currentServerTeam = computed(() => {
  if (!matchSummary.value || !isDoubles.value) return null;
  const summary = matchSummary.value as UnifiedMatchSummary;
  const serverId = summary.score?.server?.current;

  if (!serverId) return 1;

  // Check Team 1
  const t1 = summary.participants[1]?.info as any; // DoublesTeam
  if (
    t1?.players &&
    (t1.players.a.id === serverId || t1.players.b.id === serverId)
  ) {
    return 1;
  }

  // Check Team 2
  const t2 = summary.participants[2]?.info as any; // DoublesTeam
  if (
    t2?.players &&
    (t2.players.a.id === serverId || t2.players.b.id === serverId)
  ) {
    return 2;
  }

  // Fallback for legacy IDs like "1a" or "1"
  const numeric = parseInt(serverId.charAt(0));
  return !isNaN(numeric) ? numeric : 1;
});

const currentServerPosition = computed(() => {
  if (!matchSummary.value || !isDoubles.value) return null;
  const summary = matchSummary.value as UnifiedMatchSummary;
  const serverId = summary.score?.server?.current;

  if (!serverId) return "A";

  // Check Team 1
  const t1 = summary.participants[1]?.info as any;
  if (t1?.players) {
    if (t1.players.a.id === serverId) return "A";
    if (t1.players.b.id === serverId) return "B";
  }

  // Check Team 2
  const t2 = summary.participants[2]?.info as any;
  if (t2?.players) {
    if (t2.players.a.id === serverId) return "A";
    if (t2.players.b.id === serverId) return "B";
  }

  // Fallback for legacy IDs like "1a" or "2b"
  if (serverId.length >= 2) {
    const char = serverId.charAt(1).toUpperCase();
    if (char === "A" || char === "B") return char;
  }

  return "A";
});

// Robust singles server resolver to handle unified, legacy, or unknown shapes
// Robust singles server resolver using ID comparison
const isSinglesServer = (playerNum: 1 | 2): boolean => {
  const summary = matchSummary.value as UnifiedMatchSummary;
  if (!summary?.score?.server?.current) return false;

  const serverId = summary.score.server.current;
  const participant = summary.participants?.[playerNum]?.info;

  // Check strict ID match
  if (participant && (participant as any).id === serverId) return true;

  // Legacy/Fallback checks
  if (serverId === playerNum.toString()) return true;
  if (serverId === `player${playerNum}`) return true;

  return false;
};

const team1Players = computed(() => {
  if (!matchSummary.value || !isDoubles.value) return null;
  const summary = matchSummary.value as any;
  const team1 = summary.participants?.[1];
  if (team1?.info?.type === "team" && team1.info.players) {
    return {
      A: team1.info.players.a?.name || "Player A",
      B: team1.info.players.b?.name || "Player B",
    };
  }
  return {
    A: "Player A",
    B: "Player B",
  };
});

const team2Players = computed(() => {
  if (!matchSummary.value || !isDoubles.value) return null;
  const summary = matchSummary.value as any;
  const team2 = summary.participants?.[2];
  if (team2?.info?.type === "team" && team2.info.players) {
    return {
      A: team2.info.players.a?.name || "Player A",
      B: team2.info.players.b?.name || "Player B",
    };
  }
  return {
    A: "Player A",
    B: "Player B",
  };
});

onMounted(() => {
  const loadedMatch = TennisMatch.load();
  if (loadedMatch) {
    match.value = loadedMatch;
    matchSummary.value = loadedMatch.getMatchSummary();

    // Server initialization is now handled by TennisMatch constructor in v3.0.0
    // Removed legacy initialization hack that caused stats corruption

    inGame.value = true;
  }
});

const handleStartNewGame = (gameData: GameData) => {
  if (gameData.matchType === "doubles") {
    match.value = new TennisMatch(
      gameData.team1,
      gameData.team2,
      gameData.selectedSets
    );
  } else {
    match.value = new TennisMatch(
      gameData.player1,
      gameData.player2,
      gameData.selectedSets
    );
  }

  // Initialize the match by getting the summary to ensure server is set
  matchSummary.value = match.value.getMatchSummary();

  // Ensure server is initialized by scoring and undoing a point
  // Server is automatically initialized by the TennisMatch constructor

  inGame.value = true;
};

const handleDoubleFault = () => {
  if (match.value) {
    if (!matchSummary.value) return;

    if (isDoubles.value) {
      // In doubles, get the current server info
      const currentServer = (matchSummary.value as any).score?.server?.current;
      if (currentServer) {
        const serverTeam = parseInt(currentServer.charAt(0));
        const receivingTeam = serverTeam === 1 ? 2 : 1;
        // Score point for receiving team with double fault
        match.value.scorePoint(
          receivingTeam as ParticipantPosition,
          PointOutcome.DoubleFault
        );
      }
    } else {
      // Singles logic: determine receiver from server ID
      const summary = matchSummary.value as UnifiedMatchSummary;
      const serverId = summary.score?.server?.current;

      // Determine which participant is receiving based on server ID match
      let receiver: ParticipantPosition = 2;
      if ((summary.participants[2]?.info as any)?.id === serverId) {
        receiver = 1;
      }

      // Get the receiver's actual UUID
      const receiverId = (summary.participants[receiver]?.info as any)?.id;
      match.value.scorePoint(receiver, PointOutcome.DoubleFault, receiverId);
    }

    matchSummary.value = match.value.getMatchSummary();
    pointScored.value = true;
    setTimeout(() => {
      pointScored.value = false;
    }, 100);
  }
};

const handleScorePoint = (
  player: ParticipantPosition,
  outcome: PointOutcome
) => {
  if (match.value) {
    // For singles, we need to pass the unified playerId
    const summary = matchSummary.value as UnifiedMatchSummary;
    const playerId =
      (summary.participants[player]?.info as any)?.id || player.toString();

    match.value.scorePoint(player, outcome, playerId);
    matchSummary.value = match.value.getMatchSummary();
    pointScored.value = true;
    setTimeout(() => {
      pointScored.value = false;
    }, 100);
  }
};

const handleScorePointDoubles = (event: DoublesScoreEvent) => {
  if (match.value && isDoubles.value) {
    // Use the new unified API: scorePoint(team, outcome, playerId)
    // For doubles, we need to determine the playerId based on team and position
    // Player IDs are strings in the new API
    // Look up the actual UUID for the player
    const summary = matchSummary.value as UnifiedMatchSummary;
    const teamData = summary.participants[event.team]?.info as any; // DoublesTeam
    let playerId = "";

    if (teamData?.players) {
      // Map A/B to the correct player ID from the participants data
      const position = event.player === "A" ? "a" : "b";
      playerId = teamData.players[position]?.id;
    }

    if (!playerId) {
      console.error("Could not resolve player ID for doubles score", event);
      return;
    }

    match.value.scorePoint(
      event.team as ParticipantPosition,
      event.outcome as any,
      playerId
    );

    matchSummary.value = match.value.getMatchSummary();
    pointScored.value = true;
    setTimeout(() => {
      pointScored.value = false;
    }, 100);
  }
};

const handleScoreOpponentUnforced = (
  event: DoublesScoreEvent,
  playerNumber?: number
) => {
  if (match.value) {
    if (isDoubles.value) {
      // For unforced errors in doubles:
      // - ScorePlayer.vue already sends event.team as the OPPOSING team (point winner)
      // - event.player is the position of the player who made the error
      // - We need to get the error-maker's UUID from the ORIGINAL team (not event.team)
      const summary = matchSummary.value as UnifiedMatchSummary;
      const winningTeam = event.team as ParticipantPosition; // Already the opponent
      const losingTeam = event.team === 1 ? 2 : 1; // The team that made the error

      // Look up the actual UUID of the player who made the error
      const teamData = summary.participants[losingTeam]?.info as any;
      const positionKey = event.player === "A" ? "a" : "b";
      const errorPlayerId = teamData?.players?.[positionKey]?.id;

      if (!errorPlayerId) {
        console.error("Could not resolve player ID for unforced error", event);
        return;
      }

      // Score the point for the winning team (event.team)
      // The scorer ID is the error-maker for stats attribution
      match.value.scorePoint(
        winningTeam,
        PointOutcome.UnforcedError,
        errorPlayerId
      );
    } else {
      // In singles, determine the opponent based on which player's button was clicked
      if (playerNumber) {
        const summary = matchSummary.value as UnifiedMatchSummary;
        const opponent = playerNumber === 1 ? 2 : 1;

        // Get the opponent's actual UUID for the point winner
        const opponentId = (summary.participants[opponent]?.info as any)?.id;

        // Get the error-maker's UUID for stats attribution
        const errorMakerId = (
          summary.participants[playerNumber as 1 | 2]?.info as any
        )?.id;

        // Score for opponent, but attribute error to the player who made it
        match.value.scorePoint(
          opponent as ParticipantPosition,
          event.outcome,
          errorMakerId || opponentId
        );
      }
    }

    matchSummary.value = match.value.getMatchSummary();
    pointScored.value = true;
    setTimeout(() => {
      pointScored.value = false;
    }, 100);
  }
};

const handleUndoLastPoint = () => {
  if (match.value) {
    match.value.removePoint();
    matchSummary.value = match.value.getMatchSummary();
  }
};

const handleStartNewMatch = () => {
  inGame.value = false;
  match.value = null;
  matchSummary.value = null;
};
</script>

<style scoped>
.player-cards-container {
  max-width: 85%;
  margin: 0 auto;
}
</style>
