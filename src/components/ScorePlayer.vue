<script setup lang="ts">
import { PointOutcomes } from "tennisjs";
import { useIsMobile } from "../useIsMobile";

const props = defineProps<{
  playerName: string;
  isServing: boolean;
  isMatchOver: boolean;
}>();

const { isMobile } = useIsMobile();

const emit = defineEmits(["scorePoint"]);

const score = (outcome: PointOutcomes) => {
  emit("scorePoint", outcome);
};
</script>

<template>
  <div
    class="card border-primary"
    :style="{ margin: isMobile ? '0.5rem auto' : '1rem auto' }"
  >
    <div class="card-header text-center">Score Point For {{ playerName }}</div>
    <div class="card-body">
      <div v-if="isMobile" class="d-grid gap-2">
        <button
          class="btn btn-primary"
          :disabled="!isServing || isMatchOver"
          @click="score(PointOutcomes.ACE)"
        >
          Ace
        </button>
        <button
          class="btn btn-primary"
          :disabled="!isServing || isMatchOver"
          @click="score(PointOutcomes.SERVICE_WINNER)"
        >
          Service Winner
        </button>
        <button
          class="btn btn-primary"
          :disabled="isServing || isMatchOver"
          @click="score(PointOutcomes.RETURN_WINNER)"
        >
          Return Winner
        </button>
        <button
          class="btn btn-primary"
          @click="score(PointOutcomes.WINNER)"
          :disabled="isMatchOver"
        >
          Winner
        </button>
        <button
          class="btn btn-primary"
          @click="score(PointOutcomes.UNFORCED_ERROR)"
          :disabled="isMatchOver"
        >
          Opponent Unforced
        </button>
        <button
          class="btn btn-primary"
          @click="score(PointOutcomes.REGULAR)"
          :disabled="isMatchOver"
        >
          Other
        </button>
      </div>
      <div v-else class="row">
        <div class="col d-grid gap-2">
          <button
            class="btn btn-primary"
            :disabled="!isServing || isMatchOver"
            @click="score(PointOutcomes.ACE)"
          >
            Ace
          </button>
          <button
            class="btn btn-primary"
            :disabled="!isServing || isMatchOver"
            @click="score(PointOutcomes.SERVICE_WINNER)"
          >
            Service Winner
          </button>
          <button
            class="btn btn-primary"
            :disabled="isServing || isMatchOver"
            @click="score(PointOutcomes.RETURN_WINNER)"
          >
            Return Winner
          </button>
        </div>
        <div class="col d-grid gap-2">
          <button
            class="btn btn-primary"
            @click="score(PointOutcomes.WINNER)"
            :disabled="isMatchOver"
          >
            Winner
          </button>
          <button
            class="btn btn-primary"
            @click="score(PointOutcomes.UNFORCED_ERROR)"
            :disabled="isMatchOver"
          >
            Opponent Unforced
          </button>
          <button
            class="btn btn-primary"
            @click="score(PointOutcomes.REGULAR)"
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
