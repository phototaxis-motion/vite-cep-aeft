<script setup>

import { watch, ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWindowFocus } from '@vueuse/core'

const focused = useWindowFocus()
const updateCurrentSelectedItems = inject('updateCurrentSelectedItems')
watch(focused, (val) => {
  if (val) {
    updateCurrentSelectedItems()
  }
})

const route = useRoute()
</script>

<template>
  <div class="app">
    <div class="app-routes">
      <router-link
        to="/effect-collection"
        class="app-routes__item"
      >Effect Collection</router-link>
      <router-link
        to="/wiggle"
        class="app-routes__item"
      >Wiggle Effect Controller</router-link>
      <router-link
        to="proxy"
        class="app-routes__item"
      >Proxy Render</router-link>
      <router-link
        to="/2d-target"
        class="app-routes__item"
      >2D Target</router-link>
    </div>
    <a-divider></a-divider>
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
// disable scroll bar
.app {
  // fix max window
  font-family: 'Roboto', 'Noto Serif TC', Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  font-size: 12px;
}

.app-routes {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 20px;

  &__item {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 10px;
    text-decoration: none;
    color: #000;

    &:active,
    &:hover,
    &.router-link-active {
      color: #fff;
      background-color: #000;
    }
  }
}
</style>
