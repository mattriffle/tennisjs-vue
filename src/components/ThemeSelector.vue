<template>
  <Teleport to="body">
    <div v-if="isOpen" class="theme-selector-overlay" @click="close"></div>
    <div v-if="isOpen" class="theme-selector-popup card shadow-sm">
      <h5 class="card-title mb-3">Appearance</h5>

      <div class="mb-3">
        <label for="court-theme" class="form-label">Color Theme</label>
        <select id="court-theme" v-model="theme" class="form-select">
          <option value="grass">Grass Court</option>
          <option value="clay">Clay Court</option>
          <option value="hard-a">Hard Court A (Red)</option>
          <option value="hard-b">Hard Court B (Blue)</option>
        </select>
      </div>

      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="night-mode"
          v-model="nightMode"
        />
        <label class="form-check-label" for="night-mode">Night Match</label>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useTheme } from "../composables/useTheme";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close"]);

const { theme, nightMode } = useTheme();

const close = () => {
  emit("close");
};
</script>

<style scoped>
.theme-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
}

.theme-selector-popup {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 250px;
  padding: 1.5rem;
  z-index: 9999;
  background-color: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
}
</style>
