<script setup>
  import HomeButton from '@/components/HomeButton.vue'
</script>

<template>
  <section class="how-to-play">
    <h1>How to play</h1>


    <HomeButton />


    <ol>
      <li>Vyber si level</li>
      <li>Spustí sa hra</li>
      <li>Plň úlohy podľa pravidiel</li>
      <li>Zbieraj body / postupuj ďalej</li>
    </ol>
  </section>
</template>

<style scoped>
.how-to-play {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  margin-bottom: 16px;
}

ol {
  line-height: 1.6;
}
</style>
