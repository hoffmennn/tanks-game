<template>
  <RouterLink to="/" class="home-btn">← Home</RouterLink>
</template>


<style>
  .home-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;

  padding: 10px 18px;

  background: rgba(10, 20, 15, 0.65);
  backdrop-filter: blur(6px);

  border: 1px solid rgba(80, 140, 100, 0.5);
  border-radius: 8px;

  color: #e8f5e9;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;

  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.15s ease,
    box-shadow 0.25s ease;
}

.home-btn:hover {
  background: rgba(20, 40, 30, 0.85);
  border-color: #64ffda;

  transform: translateX(-2px);

  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(100, 255, 218, 0.25);
}

.home-btn.router-link-active {
  background: rgba(20, 60, 45, 0.9);
  border-color: #4dd0e1;

  box-shadow:
    0 0 14px rgba(77, 208, 225, 0.35);
}

/* MOBILE */
@media (max-width: 600px) {
  .home-btn {
    top: 16px;
    left: 16px;
    font-size: 14px;
    padding: 8px 14px;
  }
}

</style>