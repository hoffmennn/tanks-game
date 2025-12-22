<template>
  <section class="landing">
    <h1>Tanks</h1>

    <nav class="menu">
      <RouterLink to="/levels">Levels</RouterLink>
      <RouterLink to="/how-to-play">How to play</RouterLink>
      <RouterLink to="/stats">Stats</RouterLink>
    </nav>
  </section>
</template>

<style scoped>
.landing {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
