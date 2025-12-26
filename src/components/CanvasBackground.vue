<template>
  <canvas ref="canvas" class="bg-canvas"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref(null)
let ctx
let animationId
let spawnInterval

// ====== PÔVODNÝ KÓD (ZACHOVANÝ) ======

const TERRAIN_COLOR = '#5A8C4D'
const TANK_WIDTH = 60
const TANK_HEIGHT = 30
const colors = ['#2E7D32', '#1976D2', '#C62828', '#F57C00', '#5E35B1', '#00796B', '#D32F2F', '#0288D1']

let GROUND_Y
let terrain = []
let tanks = []

function generateTerrain() {
  terrain = []
  const phase1 = Math.random() * 100
  const phase2 = Math.random() * 100

  for (let x = 0; x <= canvas.value.width; x += 5) {
    let y = GROUND_Y
    y += Math.sin(x * 0.006 + phase1) * 90
    y += Math.sin(x * 0.02 + phase2) * 30

    y = Math.max(100, Math.min(canvas.value.height - 50, y))
    terrain.push({ x, y })
  }
}

function getTerrainY(x) {
  const step = 5
  const index = Math.floor(x / step)

  if (index < 0 || index >= terrain.length - 1) return GROUND_Y

  const t = (x - terrain[index].x) / step
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
  ctx.lineWidth = 3
  ctx.stroke(surfacePath)
}

function drawTank(tank) {
  const groundLeft = getTerrainY(tank.x)
  const groundRight = getTerrainY(tank.x + tank.width)
  const angle = Math.atan2(groundRight - groundLeft, tank.width)

  ctx.save()

  ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2)
  ctx.rotate(angle)
  ctx.translate(-tank.width / 2, -tank.height / 2)

  // pásy
  ctx.fillStyle = '#2c2c2c'
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(0, tank.height - 10, tank.width, 10, 5)
  } else {
    ctx.fillRect(0, tank.height - 10, tank.width, 10)
  }
  ctx.fill()

  // kolesá
  ctx.fillStyle = '#555'
  ctx.beginPath()
  for (let i = 6; i < tank.width; i += 12) {
    ctx.moveTo(i + 3, tank.height - 5)
    ctx.arc(i, tank.height - 5, 3, 0, Math.PI * 2)
  }
  ctx.fill()

  // telo
  ctx.fillStyle = tank.color
  ctx.beginPath()
  ctx.moveTo(5, tank.height - 10)
  ctx.lineTo(tank.width - 5, tank.height - 10)
  ctx.lineTo(tank.width - 10, tank.height - 22)
  ctx.lineTo(10, tank.height - 22)
  ctx.closePath()
  ctx.fill()

  // vežička
  ctx.beginPath()
  ctx.arc(tank.width / 2, tank.height - 22, 9, Math.PI, 0)
  ctx.fill()

  // hlaveň
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(tank.width / 2, tank.height - 25)
  const barrelAngle = -Math.PI * 0.2
  ctx.lineTo(
    tank.width / 2 + Math.cos(barrelAngle) * 22,
    tank.height - 25 + Math.sin(barrelAngle) * 22
  )
  ctx.stroke()

  ctx.restore()
}

function createTank() {
  return {
    x: -TANK_WIDTH - 50,
    y: 0,
    width: TANK_WIDTH,
    height: TANK_HEIGHT,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 1.5 + Math.random()
  }
}

function updateTanks() {
  for (let i = tanks.length - 1; i >= 0; i--) {
    const tank = tanks[i]
    tank.x += tank.speed

    const terrainY = getTerrainY(tank.x + tank.width / 2)
    tank.y = terrainY - tank.height

    if (tank.x > canvas.value.width + 50) {
      tanks.splice(i, 1)
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
  drawTerrain()
  for (let tank of tanks) drawTank(tank)
}

function gameLoop() {
  updateTanks()
  draw()
  animationId = requestAnimationFrame(gameLoop)
}

// ====== LIFECYCLE ======

function resize() {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  GROUND_Y = canvas.value.height * 0.7
  generateTerrain()
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

<style scoped>
.bg-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background: linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%);
  background: linear-gradient(#135874 0%, #003146 100%);
  /* Juraj zmenil pre bolest oci, ak sa nepaci dame naspat alebo upravime*/
}
</style>
