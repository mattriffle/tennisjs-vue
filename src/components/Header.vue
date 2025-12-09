<template>
  <header class="p-3 bg-light border-bottom position-relative">
    <div class="container d-flex justify-content-center align-items-center">
      <img alt="logo" src="../assets/tennisjs.png" :style="logoHeight" />

      <div class="position-absolute end-0 me-4">
        <a
          href="#"
          class="text-decoration-none text-primary fw-bold"
          @click.prevent="isThemeOpen = !isThemeOpen"
          >Theme</a
        >
      </div>
    </div>

    <ThemeSelector :is-open="isThemeOpen" @close="isThemeOpen = false" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useIsMobile } from "../useIsMobile";
import ThemeSelector from "./ThemeSelector.vue";

const { isMobile } = useIsMobile();
const isThemeOpen = ref(false);

const logoHeight = computed(() => ({
  height: isMobile.value ? "50px" : "100px",
}));
</script>

<style scoped>
header {
  margin-bottom: 1rem;
}
</style>
