<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['admin'],
});
</script>
