<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
const { setUser } = useAuth();
definePageMeta({
  layout: 'dashboard',
  middleware: ['admin'],
});

onMounted(() => {
  setUser();
});
</script>
