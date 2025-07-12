<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useIsMobile } from "../useIsMobile";
const emit = defineEmits(["undoLastPoint", "startNewMatch"]);

const { isMobile } = useIsMobile();

const currentYear = new Date().getFullYear();
const confirmNewMatch = ref(false);
let confirmTimeout: NodeJS.Timeout | number | null = null;

const handleUndo = () => {
  emit("undoLastPoint");
};

const handleNewMatchClick = () => {
  if (confirmNewMatch.value) {
    if (confirmTimeout) {
      clearTimeout(confirmTimeout);
      confirmTimeout = null;
    }
    emit("startNewMatch");
    confirmNewMatch.value = false;
  } else {
    confirmNewMatch.value = true;
    confirmTimeout = setTimeout(() => {
      confirmNewMatch.value = false;
      confirmTimeout = null;
    }, 5000);
  }
};

onUnmounted(() => {
  if (confirmTimeout) {
    clearTimeout(confirmTimeout);
  }
});
</script>

<template>
  <div>
    <div
      class="card border-primary game-card"
      :style="{ margin: isMobile ? '0.5rem auto' : '1rem auto' }"
    >
      <div class="card-body p-2">
        <div v-if="isMobile" class="d-grid gap-2">
          <button class="btn btn-primary" @click="handleUndo">
            Undo Last Point
          </button>
          <button class="btn btn-primary" @click="handleNewMatchClick">
            {{ confirmNewMatch ? "Press Again To Confirm" : "Start New Match" }}
          </button>
        </div>
        <table v-else class="table table-borderless mb-0">
          <tbody>
            <tr>
              <td class="text-center align-middle">
                <button class="btn btn-primary" @click="handleUndo">
                  Undo Last Point
                </button>
              </td>
              <td class="text-center align-middle">
                <button class="btn btn-primary" @click="handleNewMatchClick">
                  {{
                    confirmNewMatch
                      ? "Press Again To Confirm"
                      : "Start New Match"
                  }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div
      class="text-center text-muted mt-2"
      :class="{ small: !isMobile, 'x-small': isMobile }"
    >
      Copyright 2023-{{ currentYear }} Matt Riffle. Available Under The MIT
      License
      <p />
      <a
        href="https://github.com/mattriffle/tennisjs-vue"
        target="_blank"
        class="btn btn-outline-primary"
        >View On <i class="bi-github"></i>
      </a>
    </div>
  </div>
</template>

<style scoped>
.card {
}
.x-small {
  font-size: 0.7rem;
}
</style>
