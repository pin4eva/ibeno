<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="flex flex-col items-center">
        <!-- Logo placeholder -->
        <div
          class="h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4"
        >
          I
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          <slot name="title"> Welcome back </slot>
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <slot name="subtitle" />
        </p>
      </div>

      <div class="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth layout logic
</script>

<style>
input {
  width: 100%;
}
</style>
