<script setup>
import { computed } from 'vue'
import HomeButton from '@/components/HomeButton.vue'
import levelsData from '@/game_engine/configs/levels.json'
import { loadProgress } from '@/services/storageHandler.js'

const progress = loadProgress()

const levels = computed(() => {
  return levelsData.map(level => {
    const levelProgress = progress[level.id] || { unlocked: false }

    return {
      ...level,
      unlocked: levelProgress.unlocked
    }
  })
})
</script>

<template>
  <div class="levels-page">
    <HomeButton />

    <div class="levels-grid">
      <div
        v-for="level in levels"
        :key="level.id"
        class="level-card"
        :class="{ locked: !level.unlocked }"
      >
        <h3>{{ level.name }}</h3>

        
        <router-link
          v-if="level.unlocked"
          :to="'/game/' + level.id"
        >
          <button class="play-button">
            Play Level {{ level.id }}
          </button>
        </router-link>

        
        <div v-else class="locked-level">
          <span class="lock-icon">🔒</span>
          <span class="locked-text">Locked</span>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>

.levels-page {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 80px 20px 40px; 
}


.levels-grid {
  display: flex;
  flex-direction: column;
  gap: 20px; 
  width: 100%;
  max-width: 400px; 
}


.level-card {
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.level-card h3 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}


.play-button {
  background-color: #42b983; 
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s, background-color 0.2s;
}

.play-button:hover {
  background-color: #3aa876;
  transform: scale(1.05);
}

</style>
