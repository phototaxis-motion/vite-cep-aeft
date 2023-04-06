<template>
  <div>
    <a-button
      size="large"
      danger
      class="wiggle-add-button"
      @click="clickHandler"
    >新增 Wiggle Controller</a-button>
    <!-- alert -->
    <a-alert
      v-if="alertMessage"
      :message="alertMessage"
      type="error"
      show-icon
      closable
      @close="$event => alertMessage = ''"
    />
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import wiggleEffectScript from '@/scripts/wiggleEffect'
// inject evalScript
const evalScript = inject('evalScript')
const alertMessage = ref('')

const clickHandler = () => {
  evalScript(wiggleEffectScript, (res) => {
    if (res !== 'undefined' && res !== 'true') {
      alertMessage.value = res
    }
  })
}

</script>

<style lang="scss"></style>