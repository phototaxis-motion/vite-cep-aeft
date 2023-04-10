<template>
  <div>
    aaa
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
const abc = ref({ a: 1 })
defineExpose({
  abc
})
</script>

<style lang="scss" scoped></style>