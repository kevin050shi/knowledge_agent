<template>
  <div class="counter">
    <button @click="increment">
      Count is: {{ count }}
    </button>
    <p class="counter-message">
      You have clicked {{ count }} times
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<style scoped>
.counter {
  margin: 20px 0;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3aa876;
}

.counter-message {
  margin-top: 10px;
  color: #666;  
}
</style>
