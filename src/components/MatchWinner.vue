<script setup lang="ts">
import { computed } from "vue";
import { useIsMobile } from "../useIsMobile";
import type { UnifiedMatchSummary } from "tennisjs";
import { isDoublesMatch } from "../types/tennis";

const props = defineProps<{
  summary: any;
}>();

const { isMobile } = useIsMobile();

const isDoubles = computed(() => isDoublesMatch(props.summary));

const winnerDisplay = computed(() => {
  if (!props.summary) return "";

  const winner =
    (props.summary as any).score?.winner || (props.summary as any).winner;
  if (!winner) return "";

  if (isDoubles.value) {
    const winningTeam = (props.summary as any).participants?.[winner];
    const playerA = winningTeam?.info?.players?.a?.name || "Player A";
    const playerB = winningTeam?.info?.players?.b?.name || "Player B";

    return `Team ${winner} (${playerA} & ${playerB})`;
  } else {
    const playerName =
      (props.summary as any).participants?.[winner]?.info?.name ||
      (props.summary as any).meta?.player?.[winner] ||
      `Player ${winner}`;
    return playerName;
  }
});

const matchScore = computed(() => {
  if (!props.summary) return "";
  return (props.summary as any).matchScore || "";
});
</script>

<template>
  <div
    class="card bg-primary text-white game-card"
    :style="{ margin: isMobile ? '1rem auto' : '2rem auto' }"
  >
    <div class="card-body text-center">
      <h5
        class="card-title"
        v-if="summary && ((summary as any).score?.winner || (summary as any).winner)"
      >
        <i class="bi bi-trophy-fill text-warning me-2"></i>
        {{ winnerDisplay }} wins!
      </h5>
      <p class="mb-0" v-if="matchScore">Match Score: {{ matchScore }}</p>
      <small v-if="isDoubles" class="text-white-50"> Doubles Match </small>
    </div>
  </div>
</template>

<style scoped>
.card {
}
</style>
