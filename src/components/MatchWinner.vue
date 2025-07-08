<script setup lang="ts">
import { useIsMobile } from "../useIsMobile";
import type { MatchSummary } from "tennisjs";
defineProps<{
  summary: MatchSummary | null;
}>();
const { isMobile } = useIsMobile();
</script>

<template>
  <div
    class="card bg-primary text-white game-card"
    :style="{ margin: isMobile ? '1rem auto' : '2rem auto' }"
  >
    <div class="card-body text-center">
      <h5 class="card-title" v-if="summary && summary.winner">
        {{ summary.meta.player[summary.winner] }} wins! Match Score:
        {{ summary.matchScore }}
      </h5>
    </div>
  </div>
</template>

<style scoped>
.card {
}
</style>
