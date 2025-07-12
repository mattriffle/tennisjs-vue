<script setup lang="ts">
import { useIsMobile } from "../useIsMobile";
import type { MatchSummary } from "tennisjs";
const props = defineProps<{
  summary: MatchSummary | null;
}>();
const { isMobile } = useIsMobile();

const getStatsContent = (playerNum: 1 | 2) => {
  if (!props.summary) return "";
  const playerStats =
    playerNum === 1 ? props.summary.player1.stats : props.summary.player2.stats;
  const opponentStats =
    playerNum === 1 ? props.summary.player2.stats : props.summary.player1.stats;
  return `Aces: ${playerStats.ace}<br>Service Winners: ${playerStats.service_winner}<br>Return Winners: ${playerStats.return_winner}<br>Other Winners: ${playerStats.winner}<br>Unforced Errors: ${opponentStats.unforced_error}<br>Double Faults: ${opponentStats.double_fault}`;
};
</script>

<template>
  <div
    class="card border-primary game-card"
    :style="{ margin: isMobile ? '1rem auto' : '2rem auto' }"
  >
    <div class="card-header text-white bg-primary">Scoreboard</div>
    <div class="card-body">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Player</th>
            <th scope="col">Sets</th>
            <th scope="col">Games</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="summary">
            <td
              :class="{
                'fw-bold': summary.winner === 1,
                'text-primary': summary.winner === 1,
              }"
            >
              {{ summary.meta.server === 1 && !summary.winner ? "🎾" : "" }}
              {{ summary.meta.player[1] }}
              <a
                href="#"
                class="ms-2 stats-link"
                v-popover="{
                  title: 'Player Stats',
                  content: getStatsContent(1),
                }"
                >STATS</a
              >
            </td>
            <td>{{ summary.player1.sets }}</td>
            <td>{{ summary.player1.games }}</td>
            <td>{{ summary.player1.points }}</td>
          </tr>
          <tr v-if="summary">
            <td
              :class="{
                'fw-bold': summary.winner === 2,
                'text-primary': summary.winner === 2,
              }"
            >
              {{ summary.meta.server === 2 && !summary.winner ? "🎾" : "" }}
              {{ summary.meta.player[2] }}
              <a
                href="#"
                class="ms-2 stats-link"
                v-popover="{
                  title: 'Player Stats',
                  content: getStatsContent(2),
                }"
                >STATS</a
              >
            </td>
            <td>{{ summary.player2.sets }}</td>
            <td>{{ summary.player2.games }}</td>
            <td>{{ summary.player2.points }}</td>
          </tr>
          <tr v-if="!summary">
            <td colspan="4">Waiting for game to start...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card {
}
.stats-link {
  font-size: 0.75rem;
  text-decoration: underline dotted;
}
</style>
