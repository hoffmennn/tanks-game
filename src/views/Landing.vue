<template>
  <section class="landing">
    <CanvasBackground />

    <div class="content">
      <h1>Tanks</h1>

      <nav class="menu">
        <RouterLink to="/game">Quick play</RouterLink>
        <RouterLink to="/levels">Levels</RouterLink>
        <RouterLink to="/how-to-play">How to play</RouterLink>
        <RouterLink to="/stats">Stats</RouterLink>
      </nav>
    </div>
  </section>
</template>

<script setup>
import CanvasBackground from '@/components/CanvasBackground.vue'
</script>

<style scoped>
.landing {
  height: 100vh;
  overflow: hidden;
}

.content {
  position: relative;
  z-index: 1;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
  color: #e8f5e9;
}

h1 {
  font-size: 56px;
  margin-bottom: 40px;
  letter-spacing: 2px;
  text-transform: uppercase;

  text-shadow:
    0 0 5px rgba(0, 0, 0, 0.297),
    0 0 10px rgba(0, 0, 0, 0.182);
  color: #cbe9ce;
  /* Juraj zmenil, predtym bolo default */
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* MENU ITEM */
.menu a {
  width: 240px;
  padding: 14px 24px;

  background: rgba(10, 20, 15, 0.75);
  backdrop-filter: blur(6px);

  border: 1px solid rgba(80, 140, 100, 0.6);
  border-radius: 10px;

  color: #e8f5e9;
  font-size: 18px;
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
@media (max-width: 600px) {
  h1 {
    font-size: 42px;
    margin-bottom: 30px;
  }

  .menu a {
    width: 200px;
    font-size: 16px;
    padding: 12px 20px;
  }
}
</style>
