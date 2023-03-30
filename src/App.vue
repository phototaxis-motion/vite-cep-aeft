<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div>
    <!-- Home / About router link -->
    <router-link to="/">Home</router-link>
    <br>
    <router-link to="/about">About</router-link>
    <br>
    {{ route.path }}
    <router-view></router-view>
  </div>
</template>

<style scoped>
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
</style>
