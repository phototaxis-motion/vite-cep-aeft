<script setup>
import ProxyMode from '@/components/ProxyMode.vue'

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
    {{ focused }}
    <!-- Home / About router link -->
    <router-link to="/">Home</router-link>
    <br>
    <router-link to="/about">About</router-link>
    <br>
    {{ route.path }}
    <router-view></router-view>
    <ProxyMode class="proxy-mode"></ProxyMode>
  </div>
</template>

<style scoped lang="scss">
// disable scroll bar
.app {
  // fix max window
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;

}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.proxy-mode {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
