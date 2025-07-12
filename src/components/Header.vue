<template>
  <header class="p-3 bg-light border-bottom">
    <div class="container d-flex justify-content-center align-items-center">
      <img alt="logo" src="../assets/tennisjs.png" :style="logoHeight" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useIsMobile } from "../useIsMobile";
const { isMobile } = useIsMobile();

const logoHeight = computed(() => ({
  height: isMobile.value ? "50px" : "100px",
}));
</script>

<style scoped>
header {
  margin-bottom: 1rem;
}
</style>
