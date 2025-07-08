<script setup lang="ts">
import { useIsMobile } from "../useIsMobile";
const emit = defineEmits(["startNewGame"]);
const { isMobile } = useIsMobile();

const newGame = (event: Event) => {
  const formData = new FormData(event.target as HTMLFormElement);
  const player1 = formData.get("player1") as string;
  const player2 = formData.get("player2") as string;
  const selectedSets = Number(formData.get("selectedSets"));

  emit("startNewGame", {
    player1,
    player2,
    selectedSets,
  });
};
</script>

<template>
  <div class="card" :style="{ margin: isMobile ? '1rem auto' : '2rem auto' }">
    <div class="card-header text-white bg-primary">New Game</div>
    <div class="card-body">
      <form @submit.prevent="newGame">
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
        <div class="mb-3">
          <label for="sets" class="form-label">Number of Sets</label>
          <select class="form-select" id="sets" name="selectedSets">
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
        </div>
        <button type="submit" class="float-right btn btn-primary">
          Start Game
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
