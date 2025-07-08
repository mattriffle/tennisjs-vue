<template>
  <div>
    <NewGame v-if="!inGame" @startNewGame="handleStartNewGame" />
    <ScoreBoard :summary="matchSummary" v-if="inGame" />
    <MatchWinner :summary="matchSummary" v-if="matchSummary?.winner" />
    <ScoreService
      :pointScored="pointScored"
      :isMatchOver="isMatchOver"
      @doubleFault="handleDoubleFault"
      v-if="inGame"
    />
    <div class="player-cards-container" v-if="inGame">
      <div class="row">
        <div class="col" v-if="matchSummary">
          <ScorePlayer
            :playerName="matchSummary.meta.player[1]"
            :isServing="matchSummary.meta.server === 1"
            :isMatchOver="isMatchOver"
            @scorePoint="handleScorePoint(1, $event)"
          />
        </div>
        <div class="col" v-if="matchSummary">
          <ScorePlayer
            :playerName="matchSummary.meta.player[2]"
            :isServing="matchSummary.meta.server === 2"
            :isMatchOver="isMatchOver"
            @scorePoint="handleScorePoint(2, $event)"
          />
        </div>
      </div>
    </div>
    <GameControls
      @undoLastPoint="handleUndoLastPoint"
      @startNewMatch="handleStartNewMatch"
      v-if="inGame"
    />
  </div>
</template>

<script setup lang="ts">
import NewGame from "./NewGame.vue";
import ScoreBoard from "./ScoreBoard.vue";
import MatchWinner from "./MatchWinner.vue";
import ScoreService from "./ScoreService.vue";
import ScorePlayer from "./ScorePlayer.vue";
import GameControls from "./GameControls.vue";
import { ref, onMounted, computed } from "vue";
import {
  TennisMatch,
  PointOutcomes,
  type PlayerNum,
  type MatchSummary,
} from "tennisjs";

const inGame = ref(false);
const match = ref<TennisMatch | null>(null);
const matchSummary = ref<MatchSummary | null>(null);
const pointScored = ref(false);

const isMatchOver = computed(() => !!matchSummary.value?.winner);

onMounted(() => {
  const loadedMatch = TennisMatch.load();
  if (loadedMatch) {
    match.value = loadedMatch;
    matchSummary.value = loadedMatch.matchSummary();
    inGame.value = true;
  }
});

const handleStartNewGame = (gameData: {
  player1: string;
  player2: string;
  selectedSets: number;
}) => {
  match.value = new TennisMatch(
    gameData.player1,
    gameData.player2,
    gameData.selectedSets
  );
  matchSummary.value = match.value.matchSummary();
  inGame.value = true;
};

const handleDoubleFault = () => {
  if (match.value) {
    if (!matchSummary.value) return;
    const server = matchSummary.value.meta.server;
    const receiver = server === 1 ? 2 : 1;
    match.value.scorePoint(receiver, PointOutcomes.DOUBLE_FAULT);
    matchSummary.value = match.value.matchSummary();
    pointScored.value = true;
    // Reset pointScored after a short delay to allow the ScoreService component
    // to react to the change.
    setTimeout(() => {
      pointScored.value = false;
    }, 100);
  }
};

const handleScorePoint = (player: PlayerNum, outcome: PointOutcomes) => {
  if (match.value) {
    match.value.scorePoint(player, outcome);
    matchSummary.value = match.value.matchSummary();
    pointScored.value = true;
    // Reset pointScored after a short delay to allow the ScoreService component
    // to react to the change.
    setTimeout(() => {
      pointScored.value = false;
    }, 100);
  }
};

const handleUndoLastPoint = () => {
  if (match.value) {
    match.value.removePoint();
    matchSummary.value = match.value.matchSummary();
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
