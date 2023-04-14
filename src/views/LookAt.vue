<template>
  <div class="page-look-at">
    <a-button @click="clickHandler">Look At</a-button>
    <!-- async a-select focus -->
    <a-select
      v-model:value="lookAtLayerName"
      :options="options"
      :loading="loading"
      @focus="focusHandler"
    >
    </a-select>
  </div>
</template>

<script setup>
import { setSelectedLayersLookAtByName } from "@/scripts/LookAt"
import { useGetAllLayersNames } from "@/scripts/utils"
import { ref, inject, computed } from 'vue'
import { message } from 'ant-design-vue'
const lookAtLayerName = ref('')
const evalScript = inject('evalScript')

// fill a-select varibal
const layerNames = ref([])
const loading = ref(false)
// options: array<{value, label, [disabled, key, title]}>
const options = computed(() => {
  return layerNames.value.map((name) => {
    return {
      value: name,
      label: name,
    }
  })
})
const { get: getAllLayersNames } = useGetAllLayersNames();
const focusHandler = async () => {
  loading.value = true
  // fetch layer names
  layerNames.value = await getAllLayersNames()
  loading.value = false
}
const clickHandler = async () => {
  await new Promise((resolve) => {
    evalScript(setSelectedLayersLookAtByName(lookAtLayerName.value), (res) => {
      if (res !== 'undefined' && res !== 'true') {
        message.error(res)
      }
      resolve()
    })
  })
}
</script>

<style lang="scss" scoped>
.page-look-at {
  .ant-select {
    width: 100%;
  }
}
</style>