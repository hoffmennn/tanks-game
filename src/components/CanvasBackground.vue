<template>
  <canvas ref="canvas" class="bg-canvas"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: true
  }
})

const canvas = ref(null)
let ctx
let animationId
let spawnInterval

const TERRAIN_COLOR = '#5A8C4D'
const BASE_TANK_WIDTH = 60
const BASE_TANK_HEIGHT = 30
const colors = ['#2E7D32', '#1976D2', '#C62828', '#F57C00', '#5E35B1', '#00796B', '#D32F2F', '#0288D1']

let SCALE_FACTOR = 1
let GROUND_Y
let TANK_WIDTH
let TANK_HEIGHT
let TERRAIN_STEP
let terrain = []
let distantMountains = []
let tanks = []
let sunGlowPhase = 0
let clouds = []


watch(
  () => props.active,
  (isActive) => {
    if (isActive) {
      gameLoop()
    } else {
      cancelAnimationFrame(animationId)
    }
  }
)

function generateTerrain() {
  terrain = []
  const phase1 = Math.random() * 100
  const phase2 = Math.random() * 100

  for (let x = 0; x <= canvas.value.width; x += TERRAIN_STEP) {
    let y = GROUND_Y
    y += Math.sin((x * 0.006) / SCALE_FACTOR + phase1) * 90 * SCALE_FACTOR
    y += Math.sin((x * 0.02) / SCALE_FACTOR + phase2) * 30 * SCALE_FACTOR

    y = Math.max(100 * SCALE_FACTOR, Math.min(canvas.value.height - 50 * SCALE_FACTOR, y))
    terrain.push({ x, y })
  }
}

function generateDistantMountains() {
  distantMountains = []
  const phase1 = Math.random() * 100
  const phase2 = Math.random() * 100
  const baseY = canvas.value.height * 0.6

  for (let x = 0; x <= canvas.value.width; x += TERRAIN_STEP * 2) {
    let y = baseY
    y += Math.sin((x * 0.004) / SCALE_FACTOR + phase1) * 100 * SCALE_FACTOR
    y += Math.sin((x * 0.015) / SCALE_FACTOR + phase2) * 35 * SCALE_FACTOR

    y = Math.max(80 * SCALE_FACTOR, Math.min(canvas.value.height - 150 * SCALE_FACTOR, y))
    distantMountains.push({ x, y })
  }
}

function createCloud() {
  return {
    x: Math.random() * canvas.value.width,
    y: 50 * SCALE_FACTOR + Math.random() * 150 * SCALE_FACTOR,
    width: 60 * SCALE_FACTOR + Math.random() * 40 * SCALE_FACTOR,
    height: 30 * SCALE_FACTOR + Math.random() * 20 * SCALE_FACTOR,
    speed: 0.1 * SCALE_FACTOR + Math.random() * 0.15 * SCALE_FACTOR
  }
}



function initClouds() {
  clouds = []

  
  const cloudCount = window.innerWidth < 768 ? 3 : 5
  for (let i = 0; i < cloudCount; i++) {
    clouds.push(createCloud())
  }
  

}

function getTerrainY(x) {
  if (!terrain || terrain.length < 2) return GROUND_Y

  const maxX = (terrain.length - 2) * TERRAIN_STEP
  const clampedX = Math.max(0, Math.min(x, maxX))
  const index = Math.floor(clampedX / TERRAIN_STEP)

  const t = (clampedX - terrain[index].x) / TERRAIN_STEP
  return terrain[index].y + t * (terrain[index + 1].y - terrain[index].y)
}

function drawTerrain() {
  const surfacePath = new Path2D()
  surfacePath.moveTo(0, terrain[0].y)
  for (let point of terrain) {
    surfacePath.lineTo(point.x, point.y)
  }

  const fillPath = new Path2D(surfacePath)
  fillPath.lineTo(canvas.value.width, canvas.value.height)
  fillPath.lineTo(0, canvas.value.height)
  fillPath.closePath()

  ctx.fillStyle = TERRAIN_COLOR
  ctx.fill(fillPath)

  ctx.strokeStyle = '#4a6b3d'
  ctx.lineWidth = 3 * SCALE_FACTOR
  ctx.stroke(surfacePath)
}

function drawDistantMountains() {
  if (distantMountains.length === 0) return

  const mountainPath = new Path2D()
  mountainPath.moveTo(0, distantMountains[0].y)
  for (let point of distantMountains) {
    mountainPath.lineTo(point.x, point.y)
  }

  const fillPath = new Path2D(mountainPath)
  fillPath.lineTo(canvas.value.width, canvas.value.height)
  fillPath.lineTo(0, canvas.value.height)
  fillPath.closePath()

  ctx.fillStyle = 'rgba(90, 140, 77, 0.4)'
  ctx.fill(fillPath)

  ctx.strokeStyle = 'rgba(74, 107, 61, 0.4)'
  ctx.lineWidth = 2 * SCALE_FACTOR
  ctx.stroke(mountainPath)
}

function drawSun() {
  const sunX = 100 * SCALE_FACTOR
  const sunY = 100 * SCALE_FACTOR
  const sunRadius = 40 * SCALE_FACTOR
  
  // Animovaný jas okolo slnka
  sunGlowPhase += 0.02
  const glowRadius = sunRadius + 10 * SCALE_FACTOR + Math.sin(sunGlowPhase) * 5 * SCALE_FACTOR
  
  // Vonkajší žiariaci kruh
  ctx.fillStyle = 'rgba(255, 220, 100, 0.3)'
  ctx.beginPath()
  ctx.arc(sunX, sunY, glowRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // Hlavné slnko
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2)
  ctx.fill()
}

function drawClouds() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  
  for (let cloud of clouds) {
    ctx.beginPath()
    // Tri kruhy tvoriace oblak - bližšie k sebe
    ctx.arc(cloud.x, cloud.y, cloud.height, 0, Math.PI * 2)
    ctx.arc(cloud.x + cloud.width * 0.25, cloud.y - cloud.height * 0.2, cloud.height * 0.8, 0, Math.PI * 2)
    ctx.arc(cloud.x + cloud.width * 0.45, cloud.y, cloud.height * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }
}


function drawTank(tank) {
  const sampleLeftX = Math.max(0, Math.min(tank.x, canvas.value.width - 5 * SCALE_FACTOR))
  const sampleRightX = Math.max(5 * SCALE_FACTOR, Math.min(tank.x + tank.width, canvas.value.width - 5 * SCALE_FACTOR))
  const groundLeft = getTerrainY(sampleLeftX)
  const groundRight = getTerrainY(sampleRightX)
  const angle = Math.atan2(groundRight - groundLeft, tank.width)

  ctx.save()

  ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2)
  ctx.rotate(angle)
  ctx.translate(-tank.width / 2, -tank.height / 2)

  // pásy
  ctx.fillStyle = '#2c2c2c'
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(0, tank.height - 10 * SCALE_FACTOR, tank.width, 10 * SCALE_FACTOR, 5 * SCALE_FACTOR)
  } else {
    ctx.fillRect(0, tank.height - 10 * SCALE_FACTOR, tank.width, 10 * SCALE_FACTOR)
  }
  ctx.fill()

  // kolesá
  ctx.fillStyle = '#555'
  ctx.beginPath()
  for (let i = 6 * SCALE_FACTOR; i < tank.width; i += 12 * SCALE_FACTOR) {
    ctx.moveTo(i + 3 * SCALE_FACTOR, tank.height - 5 * SCALE_FACTOR)
    ctx.arc(i, tank.height - 5 * SCALE_FACTOR, 3 * SCALE_FACTOR, 0, Math.PI * 2)
  }
  ctx.fill()

  // telo
  ctx.fillStyle = tank.color
  ctx.beginPath()
  ctx.moveTo(5 * SCALE_FACTOR, tank.height - 10 * SCALE_FACTOR)
  ctx.lineTo(tank.width - 5 * SCALE_FACTOR, tank.height - 10 * SCALE_FACTOR)
  ctx.lineTo(tank.width - 10 * SCALE_FACTOR, tank.height - 22 * SCALE_FACTOR)
  ctx.lineTo(10 * SCALE_FACTOR, tank.height - 22 * SCALE_FACTOR)
  ctx.closePath()
  ctx.fill()

  // vežička
  ctx.beginPath()
  ctx.arc(tank.width / 2, tank.height - 22 * SCALE_FACTOR, 9 * SCALE_FACTOR, Math.PI, 0)
  ctx.fill()

  // hlaveň
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 4 * SCALE_FACTOR
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(tank.width / 2, tank.height - 25 * SCALE_FACTOR)
  const barrelAngle = -Math.PI * 0.2
  ctx.lineTo(
    tank.width / 2 + Math.cos(barrelAngle) * 22 * SCALE_FACTOR,
    tank.height - 25 * SCALE_FACTOR + Math.sin(barrelAngle) * 22 * SCALE_FACTOR
  )
  ctx.stroke()

  ctx.restore()
}

function createTank() {
  return {
    x: -TANK_WIDTH - 50 * SCALE_FACTOR,
    y: 0,
    width: TANK_WIDTH,
    height: TANK_HEIGHT,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: (1.5 + Math.random()) * SCALE_FACTOR
  }
}

function updateTanks() {
  for (let i = tanks.length - 1; i >= 0; i--) {
    const tank = tanks[i]
    tank.x += tank.speed

    const terrainY = getTerrainY(tank.x + tank.width / 2)
    tank.y = terrainY - tank.height

    if (tank.x > canvas.value.width + 50 * SCALE_FACTOR) {
      tanks.splice(i, 1)
    }
  }
}

function updateClouds() {
  for (let cloud of clouds) {
    cloud.x += cloud.speed
    
    if (cloud.x > canvas.value.width + cloud.width) {
      cloud.x = -cloud.width
      cloud.y = 50 * SCALE_FACTOR + Math.random() * 150 * SCALE_FACTOR
    }
  }
}



function spawnTank() {
  if (tanks.length < (window.innerWidth < 768 ? 3 : 5)) {
    tanks.push(createTank())
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  drawSun()
  drawClouds()
  drawDistantMountains()
  drawTerrain()
  for (let tank of tanks) drawTank(tank)
}

function gameLoop() {
  if (!props.active) return

  updateClouds()
  updateTanks()
  draw()
  animationId = requestAnimationFrame(gameLoop)
}

function resize() {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  
  SCALE_FACTOR = canvas.value.width / 1263
  GROUND_Y = canvas.value.height * 0.7
  TANK_WIDTH = BASE_TANK_WIDTH * SCALE_FACTOR
  TANK_HEIGHT = BASE_TANK_HEIGHT * SCALE_FACTOR
  TERRAIN_STEP = 5 * SCALE_FACTOR
  
  generateDistantMountains()
  generateTerrain()
  initClouds()
  
  // Aktualizuj existujúce tanky
  tanks.forEach(tank => {
    tank.width = TANK_WIDTH
    tank.height = TANK_HEIGHT
    tank.speed = (1.5 + Math.random()) * SCALE_FACTOR
  })
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resize()

  spawnInterval = setInterval(spawnTank, 3000)
  spawnTank()

  window.addEventListener('resize', resize)
  gameLoop()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  clearInterval(spawnInterval)
  window.removeEventListener('resize', resize)
})
</script>

<style>
.bg-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background: linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%);
}

@media print {
  .bg-canvas {
    display: none !important;
  }
}
</style>