<template>
  <UContainer class="py-20 text-center">
    <div class="max-w-lg mx-auto space-y-6">
      <UIcon name="i-heroicons-check-circle" class="w-20 h-20 text-green-500 mx-auto" />
      <h1 class="text-3xl font-bold">Application Started!</h1>
      <p class="text-gray-600 text-lg">
        We have sent an email with your <strong>Application Number</strong>. Please check your inbox
        (and spam folder) and use it to log in to complete your application.
      </p>
      <div class="pt-6">
        <UButton to="/applications/login" size="xl">Go to Login</UButton>
      </div>
    </div>
  </UContainer>
</template>
