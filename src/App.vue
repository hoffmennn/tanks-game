<template>
  <CanvasBackground :active="showBackground" />

  <div class="app-content">
    <RouterView />
  </div>
  
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CanvasBackground from '@/components/CanvasBackground.vue'

const route = useRoute()

const showBackground = computed(() => {
  return route.name !== 'game'
})
</script>
