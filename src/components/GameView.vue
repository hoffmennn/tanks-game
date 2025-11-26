<!-- zmena -->
<template>
    <div class="game-root">
        <canvas ref="canvasRef" id="gameCanvas" @mousedown="onMouseDown" @mousemove="onMouseMove"
            @mouseup="onMouseUp"></canvas>

        <div id="ui" class="ui">
            <div class="hp-bar">
                <div>Hráč HP: <span>{{ playerTank.hpDisplay }}</span></div>
                <div class="hp-fill" :style="playerBarStyle"></div>
            </div>
            <div class="hp-bar">
                <div>PC HP: <span>{{ enemyTank.hpDisplay }}</span></div>
                <div class="hp-fill" :style="enemyBarStyle"></div>
            </div>
        </div>

        <div id="windIndicator" class="wind-indicator">
            <div>Vietor: <span>{{ windValueDisplay }}</span> m/s</div>
            <div class="wind-arrow" :style="{ color: windColor }">{{ windArrow }}</div>
        </div>

        <div id="turnIndicator" class="turn-indicator" :style="{ color: turnColor }">
            <span>{{ turnText }}</span>
        </div>

        <div id="gameOver" class="game-over" v-show="!gameActive">
            <h1>{{ gameOverText }}</h1>
            <button @click="restartGame">Hrať znova</button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null

// Physics/Constants
let GROUND_Y = 0
const GRAVITY = 0.3
const TANK_WIDTH = 60
const TANK_HEIGHT = 40
const TANK_SPEED = 2

// State
const terrain = reactive([])
const windSpeed = ref(0)
const isPlayerTurn = ref(true)
const canShoot = ref(true)
const keysPressed = reactive({})

const playerTank = reactive({
    x: 100,
    y: 0,
    width: TANK_WIDTH,
    height: TANK_HEIGHT,
    hp: 100,
    color: '#2E8B57',
    get hpDisplay() { return Math.max(0, this.hp) }
})

const enemyTank = reactive({
    x: 0,
    y: 0,
    width: TANK_WIDTH,
    height: TANK_HEIGHT,
    hp: 100,
    color: '#DC143C',
    get hpDisplay() { return Math.max(0, this.hp) }
})

const projectiles = reactive([])
let dragStart = null
let dragCurrent = null
const trajectoryPoints = reactive([])
const gameActive = ref(true)
const gameOverText = ref('')

// UI computed
const windValueDisplay = computed(() => Math.abs(windSpeed.value * 100).toFixed(0))
const windArrow = computed(() => windSpeed.value > 0 ? '→' : windSpeed.value < 0 ? '←' : '•')
const windColor = computed(() => windSpeed.value > 0 ? '#ff6b6b' : windSpeed.value < 0 ? '#4ecdc4' : '#95e1d3')

const turnText = computed(() => isPlayerTurn.value ? 'Na rade: HRÁČ' : 'Na rade: PC')
const turnColor = computed(() => isPlayerTurn.value ? '#00ff00' : '#ff6b6b')

const playerBarStyle = computed(() => ({
    width: `${Math.max(0, playerTank.hp)}%`,
    background: playerTank.hp < 25 ? '#ff0000' : playerTank.hp < 50 ? '#ffaa00' : '#00ff00'
}))

const enemyBarStyle = computed(() => ({
    width: `${Math.max(0, enemyTank.hp)}%`,
    background: enemyTank.hp < 25 ? '#ff0000' : enemyTank.hp < 50 ? '#ffaa00' : '#00ff00'
}))

// Helpers
function generateTerrain() {
    terrain.length = 0
    let y = GROUND_Y
    const w = canvasRef.value.width
    for (let x = 0; x < w; x += 10) {
        y += (Math.random() - 0.5) * 15
        y = Math.max(GROUND_Y - 100, Math.min(GROUND_Y + 50, y))
        terrain.push({ x, y })
    }
}

function getTerrainY(x) {
    for (let i = 0; i < terrain.length - 1; i++) {
        const p0 = terrain[i]
        const p1 = terrain[i + 1]
        if (x >= p0.x && x < p1.x) {
            const t = (x - p0.x) / (p1.x - p0.x)
            return p0.y + t * (p1.y - p0.y)
        }
    }
    return GROUND_Y
}

function generateWind() {
    windSpeed.value = (Math.random() - 0.5) * 0.4
}

function drawTerrain() {
    ctx.fillStyle = '#654321'
    ctx.beginPath()
    ctx.moveTo(0, canvasRef.value.height)
    for (const point of terrain) ctx.lineTo(point.x, point.y)
    ctx.lineTo(canvasRef.value.width, canvasRef.value.height)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#4a3319'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, terrain[0]?.y || GROUND_Y)
    for (const point of terrain) ctx.lineTo(point.x, point.y)
    ctx.stroke()
}

function drawTank(tank) {
    ctx.fillStyle = tank.color
    ctx.fillRect(tank.x, tank.y, tank.width, tank.height)
    ctx.fillRect(tank.x + 15, tank.y - 10, 30, 15)
    ctx.fillStyle = '#333'
    ctx.fillRect(tank.x + 10, tank.y + tank.height, 15, 5)
    ctx.fillRect(tank.x + 35, tank.y + tank.height, 15, 5)
}

function drawProjectile(proj) {
    ctx.fillStyle = '#FF4500'
    ctx.beginPath()
    ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2)
    ctx.fill()
}

function drawTrajectory() {
    if (dragStart && dragCurrent) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.setLineDash([5, 5])
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(dragStart.x, dragStart.y)
        for (const p of trajectoryPoints) ctx.lineTo(p.x, p.y)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(dragStart.x, dragStart.y)
        ctx.lineTo(dragCurrent.x, dragCurrent.y)
        ctx.stroke()
    }
}

function calculateTrajectory(startX, startY, velX, velY) {
    const points = []
    let x = startX
    let y = startY
    let vx = velX
    let vy = velY
    const maxPoints = 30
    for (let i = 0; i < maxPoints; i++) {
        x += vx
        y += vy
        vy += GRAVITY
        points.push({ x, y })
        if (y > canvasRef.value.height || x < 0 || x > canvasRef.value.width) break
    }
    return points
}

function shoot(tank, targetX, targetY) {
    if (!canShoot.value) return
    const startX = tank.x + tank.width / 2
    const startY = tank.y
    const velocityX = (targetX - startX) * 0.08
    const velocityY = (targetY - startY) * 0.08
    projectiles.push({ x: startX, y: startY, vx: velocityX, vy: velocityY, isPlayer: tank === playerTank })
    canShoot.value = false
}

function enemyShoot() {
    if (!gameActive.value || !canShoot.value) return
    setTimeout(() => {
        const startX = enemyTank.x + enemyTank.width / 2
        const startY = enemyTank.y
        const randomAngle = (Math.random() - 0.5) * 1.5
        const randomPower = 8 + Math.random() * 4
        const velocityX = -(randomPower + randomAngle)
        const velocityY = -(randomPower * 1.2) + (Math.random() - 0.5) * 2
        projectiles.push({ x: startX, y: startY, vx: velocityX, vy: velocityY, isPlayer: false })
        canShoot.value = false
    }, 1000)
}

function endGame(playerWon) {
    gameActive.value = false
    gameOverText.value = playerWon ? 'VÍŤAZSTVO!' : 'PREHRA!'
}

function restartGame() {
    playerTank.hp = 100
    enemyTank.hp = 100
    playerTank.x = 100
    playerTank.y = getTerrainY(100) - TANK_HEIGHT
    enemyTank.x = canvasRef.value.width - 150
    enemyTank.y = getTerrainY(enemyTank.x) - TANK_HEIGHT
    projectiles.splice(0, projectiles.length)
    gameActive.value = true
    isPlayerTurn.value = true
    canShoot.value = true
    generateTerrain()
    generateWind()
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i]
        proj.vx += windSpeed.value
        proj.x += proj.vx
        proj.y += proj.vy
        proj.vy += GRAVITY
        const terrainY = getTerrainY(proj.x)
        if (proj.y > terrainY || proj.x < 0 || proj.x > canvasRef.value.width) {
            projectiles.splice(i, 1)
            canShoot.value = true
            isPlayerTurn.value = !isPlayerTurn.value
            if (!isPlayerTurn.value && gameActive.value) enemyShoot()
            continue
        }
        const targetTank = proj.isPlayer ? enemyTank : playerTank
        if (proj.x > targetTank.x && proj.x < targetTank.x + targetTank.width &&
            proj.y > targetTank.y && proj.y < targetTank.y + targetTank.height) {
            targetTank.hp -= 20
            projectiles.splice(i, 1)
            canShoot.value = true
            isPlayerTurn.value = !isPlayerTurn.value
            if (targetTank.hp <= 0) {
                endGame(proj.isPlayer)
            } else if (!isPlayerTurn.value && gameActive.value) {
                enemyShoot()
            }
        }
    }
}

function updateTankPosition() {
    if (keysPressed['ArrowLeft'] && isPlayerTurn.value && canShoot.value) {
        playerTank.x = Math.max(0, playerTank.x - TANK_SPEED)
        playerTank.y = getTerrainY(playerTank.x + playerTank.width / 2) - TANK_HEIGHT
    }
    if (keysPressed['ArrowRight'] && isPlayerTurn.value && canShoot.value) {
        playerTank.x = Math.min(canvasRef.value.width - playerTank.width, playerTank.x + TANK_SPEED)
        playerTank.y = getTerrainY(playerTank.x + playerTank.width / 2) - TANK_HEIGHT
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    drawTerrain()
    drawTank(playerTank)
    drawTank(enemyTank)
    for (const proj of projectiles) drawProjectile(proj)
    drawTrajectory()
}

let animId = null
function gameLoop() {
    if (gameActive.value) {
        updateProjectiles()
        updateTankPosition()
    }
    draw()
    animId = requestAnimationFrame(gameLoop)
}

// Mouse handlers
function getMousePos(event) {
    const rect = canvasRef.value.getBoundingClientRect()
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

function onMouseDown(e) {
    if (!gameActive.value || !isPlayerTurn.value || !canShoot.value) return
    const { x, y } = getMousePos(e)
    dragStart = { x: playerTank.x + playerTank.width / 2, y: playerTank.y }
    dragCurrent = { x, y }
}

function onMouseMove(e) {
    if (!gameActive.value || !isPlayerTurn.value || !canShoot.value) return
    if (dragStart) {
        const { x, y } = getMousePos(e)
        dragCurrent = { x, y }
        const velX = (x - dragStart.x) * 0.08
        const velY = (y - dragStart.y) * 0.08
        const pts = calculateTrajectory(dragStart.x, dragStart.y, velX, velY)
        trajectoryPoints.splice(0, trajectoryPoints.length, ...pts)
    }
}

function onMouseUp() {
    if (!gameActive.value || !isPlayerTurn.value || !canShoot.value) return
    if (dragStart && dragCurrent) {
        shoot(playerTank, dragCurrent.x, dragCurrent.y)
        dragStart = null
        dragCurrent = null
        trajectoryPoints.splice(0, trajectoryPoints.length)
    }
}

function handleResize() {
    const canvas = canvasRef.value
    const oldWidth = canvas.width
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    GROUND_Y = canvas.height * 0.7
    const scale = canvas.width / (oldWidth || canvas.width)
    enemyTank.x = canvas.width - 150
    enemyTank.y = getTerrainY(enemyTank.x) - TANK_HEIGHT
    playerTank.y = getTerrainY(playerTank.x + playerTank.width / 2) - TANK_HEIGHT
    generateTerrain()
}

onMounted(() => {
    const canvas = canvasRef.value
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    GROUND_Y = canvas.height * 0.7
    ctx = canvas.getContext('2d')

    enemyTank.x = canvas.width - 150
    enemyTank.y = getTerrainY(canvas.width - 150) - TANK_HEIGHT
    playerTank.y = getTerrainY(100) - TANK_HEIGHT

    generateTerrain()
    generateWind()

    // Input
    const keydown = e => { keysPressed[e.key] = true }
    const keyup = e => { keysPressed[e.key] = false }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('resize', handleResize)

    // Start enemy shoot if AI turn occurs later
    if (!isPlayerTurn.value && gameActive.value) enemyShoot()

    // Start loop
    gameLoop()

    // Cleanup
    onUnmounted(() => {
        window.removeEventListener('keydown', keydown)
        window.removeEventListener('keyup', keyup)
        window.removeEventListener('resize', handleResize)
        if (animId) cancelAnimationFrame(animId)
    })
})
</script>

<style scoped>
.game-root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    user-select: none;
    font-family: Arial, sans-serif;
    background: linear-gradient(to bottom, #87CEEB 0%, #87CEEB 70%, #654321 70%, #654321 100%);
    position: relative;
}

#gameCanvas {
    display: block;
    margin: 0 auto;
    background: transparent;
    cursor: crosshair;
}

.ui {
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-size: 18px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.wind-indicator {
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

.wind-arrow {
    font-size: 32px;
}

.turn-indicator {
    position: absolute;
    top: 120px;
    left: 20px;
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
    border-radius: 3px;
    transition: width 0.3s;
}

.game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 40px;
    border-radius: 10px;
    text-align: center;
}

.game-over h1 {
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
}

.game-over button:hover {
    background: #45a049;
}
</style>
