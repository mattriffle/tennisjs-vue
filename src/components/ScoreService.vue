<script setup lang="ts">
import { ref, watch } from "vue";
import { useIsMobile } from "../useIsMobile";

const props = defineProps<{
  pointScored: boolean;
  isMatchOver: boolean;
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
              <h5 class="card-title mb-0">Service:</h5>
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
