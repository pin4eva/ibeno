<template>
  <NuxtLayout name="auth">
    <template #title> Sign in to your account </template>
    <template #subtitle>
      Or
      <NuxtLink to="/auth/signup" class="font-medium text-primary-600 hover:text-primary-500"
        >create a new account</NuxtLink
      >
    </template>

    <form class="grid gap-2" @submit.prevent="handleLogin">
      <UFormField label="Email address" name="email">
        <UInput v-model="form.email" type="email" placeholder="user@example.com" required />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput v-model="form.password" type="password" required />
      </UFormField>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UCheckbox v-model="rememberMe" label="Remember me" />
        </div>

        <div class="text-sm">
          <NuxtLink
            to="/auth/forgot-password"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </NuxtLink>
        </div>
      </div>

      <div>
        <UButton type="submit" block :loading="authStore.loading"> Sign in </UButton>
      </div>

      <div v-if="authStore.error" class="text-red-500 text-sm text-center">
        {{ authStore.error }}
      </div>
    </form>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
});
const rememberMe = ref(false);

async function handleLogin() {
  try {
    const response = await authStore.login(form);

    if (response?.passwordUpdateRequired) {
      router.push({
        path: '/auth/update-password',
        query: { otp: response?.otp, email: form.email },
      });
      return;
    }

    if (response?.success) {
      router.push('/');
    }
  } catch (error) {
    // Error handled in store
  }
}
</script>
