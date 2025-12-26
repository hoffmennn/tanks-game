<script setup>
  import HomeButton from '@/components/HomeButton.vue'

  import levelsData from '@/game_engine/configs/levels.json'
  const levels = levelsData; 
</script>

<template>
  <div class="levels-page">
    <HomeButton />
    <div class="levels-grid">
      <div v-for="level in levels" :key="level.id" class="level-card">
        <h3>{{ level.name }}</h3>
        <router-link :to="'/game/' + level.id">
          <button class="play-button">Hrať Level {{ level.id }}</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Kontajner pre celú stránku na vycentrovanie obsahu */
.levels-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  font-family: sans-serif;
}

/* Zoradenie kariet pod seba */
.levels-grid {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Medzera medzi levelmi */
  width: 100%;
  max-width: 400px; /* Maximálna šírka zoznamu */
}

/* Štýl pre jednotlivé karty levelov */
.level-card {
  background-color: rgba(0, 0, 0, 0.75); /* Čierna s 0.75 priehľadnosťou */
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

/* Jednoduchý štýl pre tlačidlo */
.play-button {
  background-color: #42b983; /* Vue zelená */
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
