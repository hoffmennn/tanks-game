<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { useRoute, useRouter  } from 'vue-router';
import { initGame } from './engine.js';
import levelsData from './configs/levels.json';
import '@/components/HomeButton.vue';
import HomeButton from '@/components/HomeButton.vue';

let gameControls = null;
const route = useRoute();
const router = useRouter();
const isGameOver = ref(false)
const playerWon = ref(false)

onMounted(() => {
    loadLevel(route.params.id);
});


onUnmounted(() => {
    if (gameControls && gameControls.destroy) {
        gameControls.destroy();
    }
});
 

watch(
    () => route.params.id,
    (newId) => {
        loadLevel(newId);
    }
); 

const loadLevel = (id) => {
    isGameOver.value = false
    playerWon.value = false

    let level_selected = {}

    if (id) {
        const found = levelsData.find(l => String(l.id) === String(id))
        level_selected = found || {}
    }

    if (gameControls && gameControls.destroy) {
        gameControls.destroy()
    }

    gameControls = initGame(level_selected, {
        onGameEnd: (won) => {
            isGameOver.value = true
            playerWon.value = won
        }
    })
}

const triggerRestart = () => {
    isGameOver.value = false
    playerWon.value = false

    if (gameControls && gameControls.restartGame) {
        gameControls.restartGame();
    }
};

const nextLevel = () => {
    const currentId = Number(route.params.id) || 1;

    const currentIndex = levelsData.findIndex(
        l => Number(l.id) === currentId
    );

    let nextLevelId = 1;

    if (currentIndex !== -1 && levelsData[currentIndex + 1]) {
        nextLevelId = levelsData[currentIndex + 1].id;
    }

    router.push({ name: 'game', params: { id: nextLevelId } });
};
</script>


<template>
    <div class="game-container">
        <canvas id="gameCanvas"></canvas>

        <!-- UI Overlay: pointer-events: none ensures these don't block game inputs -->
        <div id="ui" class="ui-layer">
            <div class="hp-bar">
                <div>Hráč HP: <span id="playerHP">100</span></div>
                <div class="hp-fill" id="playerHPBar" style="width: 100%"></div>
            </div>
            <div class="hp-bar">
                <div>PC HP: <span id="enemyHP">100</span></div>
                <div class="hp-fill" id="enemyHPBar" style="width: 100%"></div>
            </div>
            <div class="hp-bar">
                <div>Palivo: <span id="playerFuel">100</span>%</div>
                <div class="hp-fill" id="playerFuelBar" style="width: 100%; background: #ffcc00;"></div>
            </div>
        </div>

       <div class="top-bar ui-layer">
            <HomeButton class="game-homebutton" />
            <div id="turnIndicator" class="turn-indicator">
                <span id="currentTurn">Na rade: HRÁČ</span>
            </div>
        </div>

        <div id="windIndicator" class="ui-layer wind-indicator">
            <div>Vietor: <span id="windValue">0</span> m/s</div>
            <div id="windArrow" style="font-size: 32px;">→</div>
        </div>

        <!-- 
        <div id="gameOver" class="game-over" style="display: none;">
            <h1 id="gameOverText"></h1>
            <button @click="triggerRestart">Play again</button>
            <button @click="nextLevel">Next level</button>
        </div>-->

        <div v-if="isGameOver" class="game-over">
            <h1 :style="{ color: playerWon ? '#00ff00' : '#ff0000' }">
                {{ playerWon ? 'VÍŤAZSTVO!' : 'PREHRA!' }}
            </h1>

            <button @click="triggerRestart">Play again</button>

            <button v-if="playerWon" @click="nextLevel">
                Next level
            </button>
        </div>
    </div>
</template>


<style scoped>
.ui-layer {
    position: absolute;
    pointer-events: none;
    user-select: none;
}

button {
    pointer-events: auto;
}

.game-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    overflow: hidden;
    user-select: none;
}

#gameCanvas {
    display: block;
    margin: 0 auto;
    background: transparent;
    cursor: crosshair;
}

#ui {
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-size: 18px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

#windIndicator {
    position: absolute;
    top: 20px;
    right: 20px;
    color: white;
    font-size: 24px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    background: rgba(0, 0, 0, 0.5);
    padding: 15px;
    border-radius: 5px;
}


.top-bar {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 15px;
    pointer-events: none;
    z-index: 100;
}


.top-bar :deep(.home-btn) {
    position: static; 
    pointer-events: auto; 
}

.game-homebutton {
    font-size: 22px;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
}


#turnIndicator {
    position: static; 
    transform: none;  
    color: white;
    font-size: 22px;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 5px;
    font-weight: bold;
    white-space: nowrap;
}

.hp-bar {
    margin: 10px 0;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 5px;
}

.hp-fill {
    height: 20px;
    background: #00ff00;
    border-radius: 3px;
    transition: width 0.3s;
}

.game-over {
    position: absolute;
    z-index: 5;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 40px;
    border-radius: 10px;
    text-align: center;
}

#game-over h1 {
    font-size: 48px;
    margin-bottom: 20px;
}

.game-over button {
    font-size: 24px;
    padding: 15px 30px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin: 5px;
}

.game-over button:hover {
    background: #45a049;
}
</style>