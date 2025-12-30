<template>
  <section class="landing">
    <div class="content">
      <h1 ref="titleRef">Tanks</h1>

      <nav class="menu">
        <button class="menu-btn" @click="startPlay">Play</button>
        <button class="menu-btn" @click="goTo('/levels')">Levels</button>
        <button class="menu-btn" @click="goTo('/how-to-play')">How to play</button>
        <button class="menu-btn" @click="goTo('/stats')">Stats</button>
      </nav>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const titleRef = ref(null)

const goTo = (path) => {
  router.push(path);
};

function startPlay() {
  const raw = localStorage.getItem('tanksGameLevels')

  // fallback – ak by localStorage bolo prázdne
  if (!raw) {
    router.push('/game/1')
    return
  }

  const levels = JSON.parse(raw)

  // získať odomknuté levely
  const unlockedLevels = Object.entries(levels)
    .filter(([_, data]) => data.unlocked)
    .map(([id]) => Number(id))

  if (unlockedLevels.length === 0) {
    router.push('/game/1')
    return
  }

  const lastUnlocked = Math.max(...unlockedLevels)
  router.push(`/game/${lastUnlocked}`)
}

const handleMouseMove = (e) => {
  if (!titleRef.value) return
  
  const rect = titleRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  const deltaX = (e.clientX - centerX) / 30
  const deltaY = (e.clientY - centerY) / 30
  
  titleRef.value.style.transform = `perspective(1000px) rotateY(${deltaX}deg) rotateX(${-deltaY}deg)`
}

const handleMouseLeave = () => {
  if (!titleRef.value) return
  titleRef.value.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  if (titleRef.value) {
    titleRef.value.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  if (titleRef.value) {
    titleRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<style scoped>
h1 {
  font-size: clamp(52px, 8vw, 96px);
  font-weight: 900;
  margin-bottom: clamp(30px, 5vh, 60px);
  background: linear-gradient(135deg, #6d807c 0%, #28462f 50%, #28432b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(20, 20, 15, 0.188);
  letter-spacing: clamp(4px, 0.8vw, 8px);
  position: relative;
  cursor: default;
  animation: float 3s ease-in-out infinite;
  transition: transform 0.1s ease-out, filter 0.3s ease;
}

h1::before {
  content: 'TANKS';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  background: linear-gradient(135deg, #232928 0%, #50595a 50%, #2b3131 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: blur(20px);
  opacity: 0.5;
  z-index: -1;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  from {
    opacity: 0.3;
    filter: blur(15px);
  }
  to {
    opacity: 0.6;
    filter: blur(25px);
  }
}

.landing {
  height: 100vh;
  overflow-y: auto;
}

.content {
  position: relative;
  z-index: 1;
  margin-top: 20vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #e8f5e9;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* MENU ITEM */
.menu a {
  width: clamp(200px, 30vw, 240px);
  padding: clamp(12px, 1.5vh, 14px) clamp(20px, 3vw, 24px);

  background: rgba(10, 20, 15, 0.75);
  backdrop-filter: blur(6px);

  border: 1px solid rgba(80, 140, 100, 0.6);
  border-radius: 10px;

  color: #e8f5e9;
  font-size: clamp(16px, 2vw, 18px);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-decoration: none;
  text-align: center;

  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.15s ease,
    box-shadow 0.25s ease;
}

/* Make the button look like menu links */
.menu .menu-btn {
  width: clamp(200px, 30vw, 240px);
  padding: clamp(12px, 1.5vh, 14px) clamp(20px, 3vw, 24px);
  background: rgba(10, 20, 15, 0.75);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(80, 140, 100, 0.6);
  border-radius: 10px;
  color: #e8f5e9;
  font-size: clamp(16px, 2vw, 18px);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-align: center;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.15s ease,
    box-shadow 0.25s ease;
}

.menu .menu-btn:hover {
  background: rgba(20, 40, 30, 0.9);
  border-color: #64ffda;
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.5),
    0 0 15px rgba(100, 255, 218, 0.25);
}

/* HOVER / FOCUS */
.menu a:hover {
  background: rgba(20, 40, 30, 0.9);
  border-color: #64ffda;

  transform: translateY(-2px);

  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.5),
    0 0 15px rgba(100, 255, 218, 0.25);
}

/* ACTIVE ROUTE */
.menu a.router-link-active {
  background: rgba(20, 60, 45, 0.95);
  border-color: #4dd0e1;

  box-shadow:
    0 0 18px rgba(77, 208, 225, 0.4);
}

/* MOBILE */
@media (max-width: 1000px) {
  .content {
    margin-top: 5vh;
  }
}
</style>