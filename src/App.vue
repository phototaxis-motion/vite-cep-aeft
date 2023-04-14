<script setup>

import { watch, ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWindowFocus } from '@vueuse/core'

const focused = useWindowFocus()
const updateCurrentSelectedItems = inject('updateCurrentSelectedItems')
const windowSize = inject('windowSize') // TODO
watch(focused, (val) => {
  if (val) {
    updateCurrentSelectedItems()
  }
})

const route = useRoute()
</script>

<template>
  <div
    class="app"
    :style="{ height: `${windowSize.height}px` }"
  >
    <div class="app-routes">
      <router-link
        to="/effects-preset"
        class="app-routes__item"
      >Effect Preset</router-link>
      <!-- <router-link
            to="/effect-collection"
            class="app-routes__item"
          >Effect collection</router-link> -->
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
        class="app-routes__item -disabled"
      >2D Target</router-link>
      <router-link
        to="/look-at"
        class="app-routes__item"
      >Look At</router-link>
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
  position: fixed;
  overflow: auto;
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

    &.-disabled {
      color: #ccc;
      border-color: #ccc;
      pointer-events: none;
    }
  }
}
</style>
