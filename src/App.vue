<template>
  <CanvasBackground :active="showBackground" />

  <div class="app-content">
    <RouterView />
  </div>

  <InstallPWA />
  <RotateDevice />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CanvasBackground from '@/components/CanvasBackground.vue'
import InstallPWA from '@/components/InstallPWA.vue'
import RotateDevice from '@/components/RotateDevice.vue'

const route = useRoute()

const showBackground = computed(() => {
  return route.name !== 'game'
})

// Force landscape orientation on mobile devices
onMounted(() => {
  // Lock screen orientation to landscape if supported
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch((err) => {
      console.log('Orientation lock not supported:', err)
    })
  }
})
</script>
