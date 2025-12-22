<script setup>
  import HomeButton from '@/components/HomeButton.vue'

  const levels = [1, 2, 3, 4, 5]
</script>

<template>
  <section class="levels">
    <RouterLink to="/" class="back">← Domov</RouterLink>

    <h1>Choose level</h1>

    <HomeButton />

    <ul>
      <li v-for="level in levels" :key="level">
        <RouterLink :to="`/levels/${level}`">
          Level {{ level }}
        </RouterLink>
      </li>
    </ul>
  </section>
</template>



<style scoped>
.levels {
  padding: 24px;
}

.back {
  display: inline-block;
  margin-bottom: 16px;
}

ul {
  padding: 0;
  list-style: none;
}

li {
  margin-bottom: 8px;
}
</style>
