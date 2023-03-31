<template>
  <div>
    Home <a-button @click="clickHandler">Test</a-button>
    {{ currentSelectedItems }}
    <br>
  </div>
</template>

<script setup>
import { getCurrentInstance, provide, inject } from 'vue'

// get app of vue
const app = getCurrentInstance()
const currentSelectedItems = inject('currentSelectedItems')
const updateCurrentSelectedItems = inject('updateCurrentSelectedItems')

const clickHandler = () => {
}
</script>

<style lang="scss" scoped></style>