<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useIsMobile } from "../useIsMobile";
import { isDoublesMatch } from "../types/tennis";
import type { UnifiedMatchSummary } from "tennisjs";

const props = defineProps<{
  pointScored: boolean;
  isMatchOver: boolean;
  summary: any;
}>();

const { isMobile } = useIsMobile();

const emit = defineEmits(["doubleFault"]);

const isFault = ref(false);

const handleFault = () => {
  if (isFault.value) {
    emit("doubleFault");
  } else {
    isFault.value = true;
  }
};

const currentServerDisplay = computed(() => {
  if (!props.summary) return "Service";

  const server = (props.summary as any).score?.server?.current as
    | string
    | undefined;

  // If server not yet initialized, provide a friendly default so UI isn't blank
  if (!server) {
    if (!isDoublesMatch(props.summary)) {
      // Singles: assume Player 1 serves initially
      const p1 = (props.summary as any).participants?.[1]?.info?.name;
      return p1 || "Service";
    } else {
      // Doubles: default to Team 1 Player A if available
      const team1A = (props.summary as any).participants?.[1]?.info?.players?.a
        ?.name;
      return team1A ? `${team1A} (Team 1)` : "Service";
    }
  }

  if (isDoublesMatch(props.summary)) {
    const summary = props.summary as UnifiedMatchSummary;
    // Try to find the player by ID in both teams
    const t1 = summary.participants[1]?.info as any;
    if (t1?.players) {
      if (t1.players.a.id === server) return `${t1.players.a.name} (Team 1)`;
      if (t1.players.b.id === server) return `${t1.players.b.name} (Team 1)`;
    }
    const t2 = summary.participants[2]?.info as any;
    if (t2?.players) {
      if (t2.players.a.id === server) return `${t2.players.a.name} (Team 2)`;
      if (t2.players.b.id === server) return `${t2.players.b.name} (Team 2)`;
    }

    // Fallback/Legacy parsing
    const serverTeam = parseInt(server.charAt(0));
    const serverPosition = server.charAt(1)?.toLowerCase?.();
    const teamData = (props.summary as any).participants?.[serverTeam];
    const playerName = serverPosition
      ? teamData?.info?.players?.[serverPosition]?.name
      : undefined;
    return playerName ? `${playerName} (Team ${serverTeam})` : "Service";
  } else {
    // Singles: Check matching ID
    const summary = props.summary as UnifiedMatchSummary;
    if ((summary.participants[1]?.info as any)?.id === server) {
      return summary.participants[1].info.name;
    }
    if ((summary.participants[2]?.info as any)?.id === server) {
      return summary.participants[2].info.name;
    }

    // Handle unified ("player1"/"player2") and legacy ("1"/"2") ids
    const serverNum =
      server === "player1" ? 1 : server === "player2" ? 2 : parseInt(server);
    const playerName = (props.summary as any).participants?.[serverNum]?.info
      ?.name;
    return playerName || "Service";
  }
});

const isDoubles = computed(() => isDoublesMatch(props.summary));

watch(
  () => props.pointScored,
  (newVal) => {
    if (newVal) {
      isFault.value = false;
    }
  }
);
</script>

<template>
  <div
    class="card border-primary game-card"
    :style="{ margin: isMobile ? '0.5rem auto' : '1rem auto' }"
  >
    <div class="card-body p-2">
      <table class="table table-borderless mb-0">
        <tbody>
          <tr>
            <td class="text-center align-middle">
              <h5 class="card-title mb-0">
                Service:
                <span class="text-primary">{{ currentServerDisplay }}</span>
              </h5>
              <small v-if="isDoubles" class="text-muted"> Doubles Match </small>
            </td>
            <td class="text-center align-middle">
              <button
                class="btn btn-primary"
                @click="handleFault"
                :disabled="isMatchOver"
              >
                {{ isFault ? "Double Fault" : "Fault" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card {
}
</style>
