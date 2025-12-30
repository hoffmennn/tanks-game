<script setup>
import { computed } from 'vue'
import HomeButton from '@/components/HomeButton.vue'
import { loadProgress } from '@/services/storageHandler'

const progress = loadProgress()

const stats = computed(() => {
  return Object.keys(progress)
    .map(levelId => ({
      levelId,
      ...progress[levelId]
    }))
    .sort((a, b) => Number(a.levelId) - Number(b.levelId))
})
</script>


<template>
  <section class="stats">
    <h1>Stats</h1>

    <HomeButton />

    <div class="stats-list">
      <div
        v-for="level in stats"
        :key="level.levelId"
        class="stat-card"
      >
        <template v-if="level.unlocked">
          <div class="level-title">
            Level {{ level.levelId }}
          </div>

          <div class="stat-row">
            <span>Attempts:</span>
            <span>{{ level.attempts }}</span>
          </div>

          <div class="stat-row">
            <span>Best time:</span>
            <span>
              {{ level.best_time !== null ? level.best_time/1000 + ' s' : '-' }}
            </span>
          </div>
        </template>

        <template v-else>
          <div class="level-title locked">
            Level {{ level.levelId }} 🔒
          </div>
          <div class="locked-text">
            Locked
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>

h1 {
  margin-bottom: 16px;
}

.stats {
  min-height: 100vh;
  padding: 24px;
  text-align: center;
  color: #ffffff;
}

.stats h1 {
  font-size: 2rem;
  margin-bottom: 24px;
}

.stats-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.stat-card {
  background: rgba(0, 0, 0, 0.75);
  border-radius: 12px;
  padding: 16px;
  font-weight: bold;
}

.level-title {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #9dff9d;
}

.level-title.locked {
  color: #cccccc;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #ffffff;
}

.locked-text {
  margin-top: 8px;
  color: #9dff9d;
  opacity: 0.8;
}


</style>
