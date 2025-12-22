<script setup lang="ts">
import ApplicationLoginForm from '~/components/applications/ApplicationLoginForm.vue';
</script>

<template>
  <UContainer class="py-20">
    <UCard class="max-w-md mx-auto">
      <template #header>
        <h1 class="text-2xl font-bold text-center">Applicant Login</h1>
        <p class="text-gray-500 text-center">Enter your Application No. and NIN</p>
      </template>

      <ApplicationLoginForm />
    </UCard>
  </UContainer>
</template>
