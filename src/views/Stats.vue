<script setup>
  import HomeButton from '@/components/HomeButton.vue'
</script>


<template>
  <section class="stats">
    <h1>Stats</h1>

    <HomeButton />


    <ul>
      <li>Total games played: 0</li>
      <li>Highest level reached: 0</li>
      <li>Total score: 0</li>
    </ul>
  </section>
</template>

<style scoped>
.stats {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  margin-bottom: 16px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 8px;
}
</style>
