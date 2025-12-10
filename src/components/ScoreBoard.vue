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

const getStatsContent = (playerNum: 1 | 2) => {
  if (!props.summary || isDoubles.value) return "";
  const summary = props.summary as any;
  const playerStats = summary.participants?.[playerNum]?.stats;
  const opponentNum = playerNum === 1 ? 2 : 1;
  const opponentStats = summary.participants?.[opponentNum]?.stats;

  if (!playerStats || !opponentStats) return "Statistics not available";

  return `Points Won: ${playerStats.pointsWon || 0}/${
    playerStats.pointsPlayed || 0
  }<br>Aces: ${playerStats.serving?.aces || 0}<br>Service Winners: ${
    playerStats.serving?.serviceWinners || 0
  }<br>Return Winners: ${
    playerStats.returning?.returnWinners || 0
  }<br>Winners: ${playerStats.rally?.winners || 0}<br>Unforced Errors: ${
    playerStats.rally?.unforcedErrors || 0
  }<br>Double Faults: ${playerStats.serving?.doubleFaults || 0}`;
};

const getPlayerStats = (team: 1 | 2, position?: "A" | "B") => {
  if (!props.summary || !isDoubles.value) return "";

  const summary = props.summary as any;
  const teamData = summary.participants?.[team];

  if (!teamData) return "Team data not available";

  // If a position is provided and individual stats are available, show those
  if (position && teamData.stats?.playerStats) {
    // Look up the actual player UUID from the team info
    const positionKey = position.toLowerCase() as "a" | "b";
    const playerId = teamData.info?.players?.[positionKey]?.id;

    if (!playerId) {
      return `Player ID not found for position ${position}`;
    }

    const playerStats = teamData.stats.playerStats[playerId];

    if (playerStats) {
      return `Aces: ${playerStats.serving?.aces || 0}<br>Service Winners: ${
        playerStats.serving?.serviceWinners || 0
      }<br>Return Winners: ${
        playerStats.returning?.returnWinners || 0
      }<br>Winners: ${playerStats.rally?.winners || 0}<br>Double Faults: ${
        playerStats.serving?.doubleFaults || 0
      }<br>Unforced Errors: ${playerStats.rally?.unforcedErrors || 0}`;
    }
  }

  // Default to team-level stats
  if (teamData.stats) {
    const teamStats = teamData.stats;
    return `Points Won: ${teamStats.pointsWon || 0}/${
      teamStats.pointsPlayed || 0
    }<br>Aces: ${teamStats.serving?.aces || 0}<br>Service Winners: ${
      teamStats.serving?.serviceWinners || 0
    }<br>Return Winners: ${
      teamStats.returning?.returnWinners || 0
    }<br>Winners: ${teamStats.rally?.winners || 0}<br>Double Faults: ${
      teamStats.serving?.doubleFaults || 0
    }<br>Unforced Errors: ${teamStats.rally?.unforcedErrors || 0}`;
  }

  // Final fallback: No stats available yet
  return `<strong>Statistics Not Available</strong><br><br>Statistics will be available after points are scored.`;
};

const getCurrentServerSymbol = (team: number, position?: "A" | "B") => {
  if (!props.summary || (props.summary as any).score?.winner) return "";

  const currentServer = (props.summary as any).score?.server?.current;

  if (isDoubles.value && position) {
    if (currentServer) {
      const serverTeam = parseInt(currentServer.charAt(0));
      const serverPosition = currentServer.charAt(1).toUpperCase();
      return serverTeam === team && serverPosition === position ? "🎾" : "";
    }
  } else if (!isDoubles.value) {
    if (!currentServer) return "";
    return currentServer === `player${team}` ||
      currentServer === team.toString()
      ? "🎾"
      : "";
  }
  return "";
};
</script>

<template>
  <div
    class="card border-primary game-card"
    :style="{ margin: isMobile ? '1rem auto' : '2rem auto' }"
  >
    <div class="card-header text-white bg-primary">
      Scoreboard
      <span v-if="isDoubles" class="badge bg-light text-primary ms-2"
        >Doubles</span
      >
    </div>
    <div class="card-body">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">{{ isDoubles ? "Team" : "Player" }}</th>
            <th scope="col" v-if="isDoubles">Players</th>
            <th scope="col">Sets</th>
            <th scope="col">Games</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          <!-- Singles Display -->
          <template v-if="!isDoubles && summary">
            <tr>
              <td
                :class="{
                  'fw-bold': (summary as any).score?.winner === 1,
                  'text-primary': (summary as any).score?.winner === 1,
                }"
              >
                {{ getCurrentServerSymbol(1) }}
                {{ (summary as any).participants?.[1]?.info?.name }}
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
              <td>{{ (summary as any).score?.sets?.[0] }}</td>
              <td>{{ (summary as any).score?.games?.[0] }}</td>
              <td>{{ (summary as any).score?.points?.values?.[0] }}</td>
            </tr>
            <tr>
              <td
                :class="{
                  'fw-bold': (summary as any).score?.winner === 2,
                  'text-primary': (summary as any).score?.winner === 2,
                }"
              >
                {{ getCurrentServerSymbol(2) }}
                {{ (summary as any).participants?.[2]?.info?.name }}
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
              <td>{{ (summary as any).score?.sets?.[1] }}</td>
              <td>{{ (summary as any).score?.games?.[1] }}</td>
              <td>{{ (summary as any).score?.points?.values?.[1] }}</td>
            </tr>
          </template>

          <!-- Doubles Display -->
          <template v-else-if="isDoubles && summary">
            <!-- Team 1 -->
            <tr>
              <td
                rowspan="2"
                class="align-middle fw-bold"
                :class="{
                  'text-primary': (summary as any).score?.winner === 1,
                }"
              >
                Team 1
                <a
                  href="#"
                  class="ms-2 stats-link"
                  v-popover="{
                    title: 'Team Stats',
                    content: getPlayerStats(1),
                  }"
                  >STATS</a
                >
              </td>
              <td>
                {{ getCurrentServerSymbol(1, "A") }}
                {{ (summary as any).participants?.[1]?.info?.players?.a?.name }}
                <a
                  href="#"
                  class="ms-2 stats-link"
                  v-popover="{
                    title: 'Player Stats',
                    content: getPlayerStats(1, 'A'),
                  }"
                  >STATS</a
                >
              </td>
              <td rowspan="2" class="align-middle">
                {{ (summary as any).score?.sets?.[0] }}
              </td>
              <td rowspan="2" class="align-middle">
                {{ (summary as any).score?.games?.[0] }}
              </td>
              <td rowspan="2" class="align-middle">
                {{ (summary as any).score?.points?.values?.[0] }}
              </td>
            </tr>
            <tr>
              <td>
                {{ getCurrentServerSymbol(1, "B") }}
                {{ (summary as any).participants?.[1]?.info?.players?.b?.name }}
                <a
                  href="#"
                  class="ms-2 stats-link"
                  v-popover="{
                    title: 'Player Stats',
                    content: getPlayerStats(1, 'B'),
                  }"
                  >STATS</a
                >
              </td>
            </tr>

            <!-- Team 2 -->
            <tr>
              <td
                rowspan="2"
                class="align-middle fw-bold"
                :class="{
                  'text-primary': (summary as any).score?.winner === 2,
                }"
              >
                Team 2
                <a
                  href="#"
                  class="ms-2 stats-link"
                  v-popover="{
                    title: 'Team Stats',
                    content: getPlayerStats(2),
                  }"
                  >STATS</a
                >
              </td>
              <td>
                {{ getCurrentServerSymbol(2, "A") }}
                {{ (summary as any).participants?.[2]?.info?.players?.a?.name }}
                <a
                  href="#"
                  class="ms-2 stats-link"
                  v-popover="{
                    title: 'Player Stats',
                    content: getPlayerStats(2, 'A'),
                  }"
                  >STATS</a
                >
              </td>
              <td rowspan="2" class="align-middle">
                {{ (summary as any).score?.sets?.[1] }}
              </td>
              <td rowspan="2" class="align-middle">
                {{ (summary as any).score?.games?.[1] }}
              </td>
              <td rowspan="2" class="align-middle">
                {{ (summary as any).score?.points?.values?.[1] }}
              </td>
            </tr>
            <tr>
              <td>
                {{ getCurrentServerSymbol(2, "B") }}
                {{ (summary as any).participants?.[2]?.info?.players?.b?.name }}
                <a
                  href="#"
                  class="ms-2 stats-link"
                  v-popover="{
                    title: 'Player Stats',
                    content: getPlayerStats(2, 'B'),
                  }"
                  >STATS</a
                >
              </td>
            </tr>
          </template>

          <!-- No game started -->
          <tr v-if="!summary">
            <td :colspan="isDoubles ? 5 : 4">Waiting for game to start...</td>
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
