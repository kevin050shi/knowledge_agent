<template>
  <div id="app">
    <h1>Vue 3 + TypeScript App</h1>
    <Counter />
  </div>
</template>

<!-- setup -> VUE 3 component API / VUE 2 options API -->
<script setup lang="ts">
import Counter from './components/Counter.vue'
</script>

<!-- scoped -> 本文件起作用 -->
<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>