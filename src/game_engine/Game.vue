<script setup>
import { onMounted } from 'vue';
import { initGame } from './engine.js';

let gameControls = null;

onMounted(async () => {
    gameControls = await initGame();
});

const triggerRestart = () => {
    if (gameControls && gameControls.restartGame) {
        gameControls.restartGame();
    }
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

        <div id="windIndicator" class="ui-layer wind-indicator">
            <div>Vietor: <span id="windValue">0</span> m/s</div>
            <div id="windArrow" style="font-size: 32px;">→</div>
        </div>

        <div id="turnIndicator" class="ui-layer turn-indicator">
            <span id="currentTurn">Na rade: HRÁČ</span>
        </div>

        <div id="gameOver" class="game-over" style="display: none;">
            <h1 id="gameOverText"></h1>
            <button @click="triggerRestart">Hrať znova</button>
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
    background: #5f9ab1;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background: #5f9ab1;
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

#turnIndicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 22px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 5px;
    font-weight: bold;
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

#gameOver {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 40px;
    border-radius: 10px;
    text-align: center;
    display: none;
}

#gameOver h1 {
    font-size: 48px;
    margin-bottom: 20px;
}

#gameOver button {
    font-size: 24px;
    padding: 15px 30px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
}

#gameOver button:hover {
    background: #45a049;
}
</style>