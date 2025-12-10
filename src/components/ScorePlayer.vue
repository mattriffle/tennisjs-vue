<script setup lang="ts">
import { ref, computed } from "vue";
import { PointOutcome } from "tennisjs";
import { useIsMobile } from "../useIsMobile";
import type {
  PlayerPosition,
  TeamNumber,
  DoublesScoreEvent,
} from "../types/tennis";

const props = defineProps<{
  // Common props
  isServing: boolean;
  isMatchOver: boolean;
  isDoubles?: boolean;

  // Singles props
  playerName?: string;

  // Doubles props
  teamName?: string;
  teamNumber?: TeamNumber;
  players?: { A: string; B: string } | null;
  currentServerPosition?: PlayerPosition | null;
}>();

const { isMobile } = useIsMobile();

const emit = defineEmits<{
  scorePoint: [outcome: PointOutcome];
  scorePointDoubles: [event: DoublesScoreEvent];
  scoreOpponentUnforced: [event: DoublesScoreEvent];
}>();

const selectedPlayer = ref<PlayerPosition>("A");

const score = (outcome: PointOutcome) => {
  if (props.isDoubles && props.teamNumber) {
    emit("scorePointDoubles", {
      team: props.teamNumber,
      player: selectedPlayer.value,
      outcome,
    });
  } else {
    emit("scorePoint", outcome);
  }
};

const scoreOpponentUnforced = () => {
  if (props.isDoubles && props.teamNumber) {
    // Score for the opposing team
    const opposingTeam = props.teamNumber === 1 ? 2 : 1;
    emit("scoreOpponentUnforced", {
      team: opposingTeam,
      player: selectedPlayer.value, // The selected player made the error
      outcome: PointOutcome.UnforcedError,
    });
  } else {
    // In singles, we don't need to pass the event structure
    // The ControlCenter will handle it based on which player's button was clicked
    emit("scoreOpponentUnforced", {
      team: 1 as TeamNumber, // Placeholder, will be ignored
      player: "A" as PlayerPosition, // Placeholder, will be ignored
      outcome: PointOutcome.UnforcedError,
    });
  }
};

const displayName = computed(() => {
  if (props.isDoubles && props.teamName) {
    return props.teamName;
  }
  return props.playerName || "Player";
});

const currentPlayerName = computed(() => {
  if (props.isDoubles && props.players) {
    return props.players[selectedPlayer.value];
  }
  return props.playerName || "Player";
});

// Check if the currently selected player is the server
const isSelectedPlayerServing = computed(() => {
  if (!props.isDoubles) {
    // In singles, use the isServing prop directly
    return props.isServing;
  }

  // In doubles, check if the selected player matches the current server position
  if (!props.isServing || !props.currentServerPosition) {
    return false;
  }

  return selectedPlayer.value === props.currentServerPosition;
});

// Check if the receiving team should have Return Winner enabled
const isReceivingTeam = computed(() => {
  // In singles or when team is serving, return the opposite of isServing
  // In doubles when team is not serving, return true
  return !props.isServing;
});
</script>

<template>
  <div
    class="card border-primary"
    :style="{ margin: isMobile ? '0.5rem auto' : '1rem auto' }"
  >
    <div class="card-header text-center">Score Point For {{ displayName }}</div>

    <!-- Player Selector for Doubles -->
    <div v-if="isDoubles && players" class="card-body pb-0">
      <div class="btn-group w-100 mb-2" role="group">
        <input
          type="radio"
          class="btn-check"
          :id="`player-a-${teamNumber}`"
          v-model="selectedPlayer"
          value="A"
        />
        <label
          class="btn btn-sm btn-outline-primary"
          :for="`player-a-${teamNumber}`"
        >
          {{ players.A }}
        </label>

        <input
          type="radio"
          class="btn-check"
          :id="`player-b-${teamNumber}`"
          v-model="selectedPlayer"
          value="B"
        />
        <label
          class="btn btn-sm btn-outline-primary"
          :for="`player-b-${teamNumber}`"
        >
          {{ players.B }}
        </label>
      </div>
      <div class="text-center text-muted small mb-2">
        Scoring for: <strong>{{ currentPlayerName }}</strong>
      </div>
    </div>

    <div class="card-body" :class="{ 'pt-0': isDoubles && players }">
      <div v-if="isMobile" class="d-grid gap-2">
        <button
          class="btn btn-primary"
          :disabled="!isSelectedPlayerServing || isMatchOver"
          @click="score(PointOutcome.Ace)"
        >
          Ace
        </button>
        <button
          class="btn btn-primary"
          :disabled="!isSelectedPlayerServing || isMatchOver"
          @click="score(PointOutcome.ServiceWinner)"
        >
          Service Winner
        </button>
        <button
          class="btn btn-primary"
          :disabled="!isReceivingTeam || isMatchOver"
          @click="score(PointOutcome.ReturnWinner)"
        >
          Return Winner
        </button>
        <button
          class="btn btn-primary"
          @click="score(PointOutcome.Winner)"
          :disabled="isMatchOver"
        >
          Winner
        </button>
        <button
          class="btn btn-danger"
          @click="scoreOpponentUnforced"
          :disabled="isMatchOver"
        >
          Unforced
        </button>
        <button
          class="btn btn-primary"
          @click="score(PointOutcome.Regular)"
          :disabled="isMatchOver"
        >
          Other
        </button>
      </div>
      <div v-else class="row">
        <div class="col d-grid gap-2">
          <button
            class="btn btn-primary"
            :disabled="!isSelectedPlayerServing || isMatchOver"
            @click="score(PointOutcome.Ace)"
          >
            Ace
          </button>
          <button
            class="btn btn-primary"
            :disabled="!isSelectedPlayerServing || isMatchOver"
            @click="score(PointOutcome.ServiceWinner)"
          >
            Service Winner
          </button>
          <button
            class="btn btn-primary"
            :disabled="!isReceivingTeam || isMatchOver"
            @click="score(PointOutcome.ReturnWinner)"
          >
            Return Winner
          </button>
        </div>
        <div class="col d-grid gap-2">
          <button
            class="btn btn-primary"
            @click="score(PointOutcome.Winner)"
            :disabled="isMatchOver"
          >
            Winner
          </button>
          <button
            class="btn btn-danger"
            @click="scoreOpponentUnforced"
            :disabled="isMatchOver"
          >
            Unforced
          </button>
          <button
            class="btn btn-primary"
            @click="score(PointOutcome.Regular)"
            :disabled="isMatchOver"
          >
            Other
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
}
</style>
