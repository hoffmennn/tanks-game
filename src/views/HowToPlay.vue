<script setup>
  import HomeButton from '@/components/HomeButton.vue'
</script>
<template>
  <section class="how-to-play">
    <h1>How to play</h1>

    <HomeButton />

    <ul class="instructions-list">
      <li>Choose a level to start playing. Levels are unlocked progressively as you advance.</li>
      <li>Each level has an enemy that you must defeat to win.</li>
      <li>Aim and shoot by dragging the mouse (or your finger on touch devices) and releasing.</li>
      <li>If you defeat the enemy, you successfully complete the level.</li>
      <li>
        In the <strong>Stats</strong> section, you can track your progress:
      </li>
    </ul>
    
  </section>
</template>

<style scoped>
.how-to-play {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 24px;
}

.instructions-list {
  line-height: 1.8;
  font-size: 1.05rem;
  color: #ffffff;
  list-style: none;
  padding: 0;
  counter-reset: step-counter;
}

.instructions-list > li {
  position: relative;
  padding: 16px 20px 16px 50px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  counter-increment: step-counter;
}

.instructions-list > li::before {
  content: counter(step-counter);
  position: absolute;
  left: 16px;
  top: 16px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #66eaa4 0%, #4ba0a2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.instructions-list > li:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

strong {
  color: #667eea;
  font-weight: 600;
}

.sub-list {
  margin-top: 12px;
  margin-left: 0;
  padding-left: 0;
  list-style: none;
}

.sub-list li {
  position: relative;
  padding: 8px 0 8px 28px;
  color: #546e7a;
  font-size: 0.95rem;
}

.sub-list li::before {
  content: "→";
  position: absolute;
  left: 8px;
  color: #667eea;
  font-weight: bold;
}
</style>