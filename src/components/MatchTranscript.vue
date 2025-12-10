<script setup lang="ts">
import { ref, computed } from "vue";
import type {
  UnifiedMatchSummary,
  GameSummary,
  SetSummary,
  PointSummary,
} from "tennisjs";

const props = defineProps<{
  summary: UnifiedMatchSummary;
}>();

const isOpen = ref(false);
type SortOrder = "asc" | "desc";
const sortOrder = ref<SortOrder>("desc");

const toggleTranscript = () => {
  isOpen.value = !isOpen.value;
};

const toggleSort = (e: Event) => {
  e.stopPropagation();
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

// Start with just sets
const sets = computed(() => {
  const allSets: {
    setNum: number;
    games: { data: GameSummary; p1Score: number; p2Score: number }[];
    summary?: SetSummary;
    finalScore: string;
  }[] = [];

  const processSet = (
    games: GameSummary[],
    setNum: number,
    summary?: SetSummary
  ) => {
    let p1Score = 0;
    let p2Score = 0;

    // Calculate running scores first (always chronological calculation)
    const gamesWithScores = games.map((game) => {
      if (game.winner === 1) p1Score++;
      else if (game.winner === 2) p2Score++;
      return {
        data: game,
        p1Score,
        p2Score,
      };
    });

    // Sort games if needed
    const displayedGames =
      sortOrder.value === "desc"
        ? [...gamesWithScores].reverse()
        : gamesWithScores;

    // Sort points within games if needed
    displayedGames.forEach((g) => {
      if (sortOrder.value === "desc") {
        g.data = { ...g.data, points: [...g.data.points].reverse() };
      }
    });

    allSets.push({
      setNum,
      games: displayedGames,
      summary,
      finalScore: `${p1Score}-${p2Score}`,
    });
  };

  // Completed sets
  props.summary.setHistory.forEach((set, index) => {
    processSet(set.games, index + 1, set);
  });

  // Current set (if there are games played)
  if (props.summary.currentSetGames.length > 0) {
    processSet(props.summary.currentSetGames, props.summary.currentSet);
  }

  // Sort sets
  return sortOrder.value === "desc" ? allSets.reverse() : allSets;
});

// Helper to format point outcome
const formatOutcome = (point: PointSummary) => {
  if (point.outcome === "ace") return "Ace";
  if (point.outcome === "doubleFault") return "Double Fault";
  if (point.outcome === "winner") return "Winner";
  if (point.outcome === "unforcedError") return "Unforced Error";
  if (point.outcome === "forcedError") return "Forced Error";
  if (point.outcome === "serviceWinner") return "Service Winner";
  return "Point";
};

const getParticipantName = (id: string) => {
  const p1 = props.summary.participants[1].info;
  const p2 = props.summary.participants[2].info;

  if (p1.id === id) return p1.name;
  if (p2.id === id) return p2.name;

  // Fallback for legacy IDs
  if (id === "1") return p1.name;
  if (id === "2") return p2.name;

  // Check doubles players
  if (p1.type === "team") {
    if (p1.players.a.id === id) return p1.players.a.name;
    if (p1.players.b.id === id) return p1.players.b.name;
  }
  if (p2.type === "team") {
    if (p2.players.a.id === id) return p2.players.a.name;
    if (p2.players.b.id === id) return p2.players.b.name;
  }

  return "Unknown";
};

// Helper to get formatted score for the point
// Since PointSummary implies the outcome *of that point*, the score *after* the point isn't explicitly stored in PointSummary?
// Wait, PointSummary has `score` (Wait, no, looking at type definition...)
// PointSummary: winner, outcome, server, scorer, fault?
// GameSummary has `points: PointSummary[]`.
// We might need to recalculate the running score to display it nicely, or just list the outcomes.
// The user asked for "outcome of each point".
// Let's just list the outcome and winner for now.

const getActorName = (point: PointSummary) => {
  // 1. Handle Double Faults (Actor is always the server)
  if (point.outcome === "doubleFault") {
    return getParticipantName(point.server);
  }

  // 2. Handle Errors (Actor is usually the loser of the point)
  // Unless scorer is explicitly set (doubles error attribution)
  if (point.outcome === "unforcedError" || point.outcome === "forcedError") {
    if (point.scorer) return getParticipantName(point.scorer);

    // In singles (or if scorer missing), the loser committed the error
    const loserPos = point.winner === 1 ? 2 : 1;
    const loserInfo = props.summary.participants[loserPos].info;
    return loserInfo.name; // For teams this returns "Team Name"
  }

  // 3. Handle Winners/Aces/Service Winners (Actor is the winner)
  if (point.scorer) {
    return getParticipantName(point.scorer);
  }

  const winnerInfo = props.summary.participants[point.winner].info;
  return winnerInfo.name;
};
</script>

<template>
  <div class="card mb-3 border-primary overflow-hidden">
    <div
      class="card-header d-flex justify-content-between align-items-center cursor-pointer bg-light text-primary"
      @click="toggleTranscript"
      role="button"
    >
      <div class="d-flex align-items-center">
        <h6 class="mb-0 fw-bold me-2">
          <i class="bi bi-clock-history me-2"></i>Match Transcript
        </h6>
        <button
          class="btn btn-sm btn-outline-primary py-0 px-2"
          @click="toggleSort"
          title="Toggle Sort Order"
        >
          <i
            class="bi"
            :class="sortOrder === 'desc' ? 'bi-sort-down' : 'bi-sort-up'"
          ></i>
        </button>
      </div>
      <i class="bi" :class="isOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </div>

    <div v-if="isOpen" class="card-body p-0">
      <div v-if="sets.length === 0" class="p-3 text-center text-muted">
        No completed games yet.
      </div>

      <div v-else class="accordion accordion-flush" id="transcriptAccordion">
        <div v-for="set in sets" :key="set.setNum" class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed fw-bold bg-light text-dark"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="'#set-' + set.setNum"
            >
              Set {{ set.setNum }} ({{ set.finalScore }})
            </button>
          </h2>
          <div
            :id="'set-' + set.setNum"
            class="accordion-collapse collapse show"
          >
            <!-- Default expanded for now to see content -->
            <div class="accordion-body p-0">
              <div
                v-for="(game, gameIndex) in set.games"
                :key="gameIndex"
                class="game-block border-bottom"
              >
                <div
                  class="p-2 bg-light-subtle d-flex justify-content-between align-items-center"
                >
                  <span class="fw-bold small">
                    Game
                    {{
                      sortOrder === "desc"
                        ? set.games.length - gameIndex
                        : gameIndex + 1
                    }}
                    ({{ game.p1Score }}-{{ game.p2Score }})
                  </span>
                  <span class="badge bg-secondary"
                    >{{ getParticipantName(game.data.server) }} Serving</span
                  >
                  <span class="badge bg-primary" v-if="game.data.winner"
                    >Won by
                    {{
                      getParticipantName(
                        props.summary.participants[game.data.winner].info.id
                      )
                    }}</span
                  >
                </div>

                <table class="table table-sm table-borderless mb-0 small">
                  <tbody>
                    <tr
                      v-for="(point, pIndex) in game.data.points"
                      :key="pIndex"
                    >
                      <td class="text-center text-muted" style="width: 30px">
                        {{
                          sortOrder === "desc"
                            ? game.data.points.length - pIndex
                            : pIndex + 1
                        }}
                      </td>
                      <td>
                        <span
                          class="fw-bold"
                          :class="
                            [
                              'unforcedError',
                              'forcedError',
                              'doubleFault',
                            ].includes(point.outcome)
                              ? 'text-danger'
                              : 'text-primary'
                          "
                        >
                          {{ formatOutcome(point) }}
                        </span>
                        by {{ getActorName(point) }}
                      </td>
                      <td class="text-end text-muted small" style="width: 60px">
                        <span v-if="point.score"
                          >{{ point.score[0] }}-{{ point.score[1] }}</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.bg-light-subtle {
  background-color: rgba(var(--bs-light-rgb), 0.5);
}
</style>
