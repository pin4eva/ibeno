<template>
  <NuxtLayout name="auth">
    <template #title> Reset your password </template>
    <template #subtitle>
      Enter your email address and we'll send you a link to reset your password.
    </template>

    <form class="grid gap-2" @submit.prevent="handleForgotPassword">
      <UFormField label="Email address" name="email">
        <UInput v-model="email" type="email" required placeholder="user@example.com" />
      </UFormField>

      <div>
        <UButton type="submit" block :loading="loading"> Send Reset Link </UButton>
      </div>

      <div class="text-sm text-center">
        <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
          Back to sign in
        </NuxtLink>
      </div>

      <div v-if="message" class="text-green-500 text-sm text-center">
        {{ message }}
      </div>
      <div v-if="error" class="text-red-500 text-sm text-center">
        {{ error }}
      </div>
    </form>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

definePageMeta({
  layout: false,
});

const { loading, forgotPassword, error } = useAuthStore();
const email = ref('');
const message = ref('');

async function handleForgotPassword() {
  try {
    await forgotPassword(email.value).then(() => {
      if (!error) {
        message.value = 'If an account with that email exists, a reset link has been sent.';
      }
    });
  } catch {
    // Error handled in store
  } finally {
    console.log({ error });
  }
}
</script>
