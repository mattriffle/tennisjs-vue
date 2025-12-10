<script setup lang="ts">
import { ref } from "vue";
import { useIsMobile } from "../useIsMobile";
import type { GameData } from "../types/tennis";

const emit = defineEmits<{
  startNewGame: [gameData: GameData];
}>();

const { isMobile } = useIsMobile();

const matchType = ref<"singles" | "doubles">("singles");

const newGame = (event: Event) => {
  const formData = new FormData(event.target as HTMLFormElement);
  const selectedSets = Number(formData.get("selectedSets"));

  if (matchType.value === "singles") {
    emit("startNewGame", {
      matchType: "singles",
      player1: formData.get("player1") as string,
      player2: formData.get("player2") as string,
      selectedSets,
    });
  } else {
    emit("startNewGame", {
      matchType: "doubles",
      team1: [
        formData.get("team1PlayerA") as string,
        formData.get("team1PlayerB") as string,
      ],
      team2: [
        formData.get("team2PlayerA") as string,
        formData.get("team2PlayerB") as string,
      ],
      selectedSets,
    });
  }
};
</script>

<template>
  <div class="card" :style="{ margin: isMobile ? '1rem auto' : '2rem auto' }">
    <div class="card-header text-white bg-primary">New Game</div>
    <div class="card-body">
      <form @submit.prevent="newGame">
        <!-- Match Type Selector -->
        <div class="mb-3">
          <label class="form-label">Match Type</label>
          <div class="btn-group w-100" role="group">
            <input
              type="radio"
              class="btn-check"
              id="singles"
              v-model="matchType"
              value="singles"
            />
            <label class="btn btn-outline-primary" for="singles">
              <i class="bi bi-person-fill"></i> Singles
            </label>

            <input
              type="radio"
              class="btn-check"
              id="doubles"
              v-model="matchType"
              value="doubles"
            />
            <label class="btn btn-outline-primary" for="doubles">
              <i class="bi bi-people-fill"></i> Doubles
            </label>
          </div>
        </div>

        <!-- Singles Inputs -->
        <div v-if="matchType === 'singles'">
          <div class="mb-3">
            <label for="player1" class="form-label">Player 1 Name</label>
            <input
              type="text"
              class="form-control"
              id="player1"
              name="player1"
              required
            />
          </div>
          <div class="mb-3">
            <label for="player2" class="form-label">Player 2 Name</label>
            <input
              type="text"
              class="form-control"
              id="player2"
              name="player2"
              required
            />
          </div>
        </div>

        <!-- Doubles Inputs -->
        <div v-else>
          <div class="mb-3">
            <label class="form-label fw-bold text-primary">Team 1</label>
            <div class="input-group mb-2">
              <span class="input-group-text">Player A</span>
              <input
                type="text"
                class="form-control"
                name="team1PlayerA"
                placeholder="First player name"
                required
              />
            </div>
            <div class="input-group">
              <span class="input-group-text">Player B</span>
              <input
                type="text"
                class="form-control"
                name="team1PlayerB"
                placeholder="Second player name"
                required
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold text-primary">Team 2</label>
            <div class="input-group mb-2">
              <span class="input-group-text">Player A</span>
              <input
                type="text"
                class="form-control"
                name="team2PlayerA"
                placeholder="First player name"
                required
              />
            </div>
            <div class="input-group">
              <span class="input-group-text">Player B</span>
              <input
                type="text"
                class="form-control"
                name="team2PlayerB"
                placeholder="Second player name"
                required
              />
            </div>
          </div>
        </div>

        <!-- Number of Sets -->
        <div class="mb-3">
          <label for="sets" class="form-label">Number of Sets</label>
          <select class="form-select" id="sets" name="selectedSets">
            <option value="1">1</option>
            <option value="3" selected>3</option>
            <option value="5">5</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary w-100">
          <i class="bi bi-play-fill"></i> Start Game
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card {
  max-width: 400px;
  margin: 2rem auto;
}
</style>
