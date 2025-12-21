<template>
  <NuxtLayout name="auth">
    <template #title> Create your account </template>
    <template #subtitle>
      Already have an account?
      <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500"
        >Sign in</NuxtLink
      >
    </template>

    <form class="grid gap-2" @submit.prevent="handleSignup">
      <!-- Token is usually pre-filled from URL query -->
      <UFormField v-if="!hasToken" label="Invitation Token" name="token">
        <UInput v-model="form.token" required placeholder="Paste your invitation token" />
      </UFormField>

      <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <UFormField label="First Name" name="firstName">
          <UInput v-model="form.firstName" required />
        </UFormField>

        <UFormField label="Last Name" name="lastName">
          <UInput v-model="form.lastName" required />
        </UFormField>
      </div>

      <UFormField label="Email address" name="email">
        <UInput v-model="form.email" type="email" required />
      </UFormField>

      <UFormField label="Phone Number" name="phone">
        <UInput v-model="form.phone" type="tel" required />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput v-model="form.password" type="password" required />
      </UFormField>

      <UFormField label="Confirm Password" name="confirmPassword">
        <UInput v-model="confirmPassword" type="password" required />
      </UFormField>

      <div>
        <UButton type="submit" block :loading="authStore.loading"> Sign up </UButton>
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

const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  token: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
});

const confirmPassword = ref('');

const hasToken = computed(() => !!route.query.token);

onMounted(() => {
  if (route.query.token) {
    form.token = route.query.token as string;
  }
  if (route.query.email) {
    form.email = route.query.email as string;
  }
});

async function handleSignup() {
  if (form.password !== confirmPassword.value) {
    authStore.error = 'Passwords do not match';
    return;
  }

  try {
    await authStore.signup(form);
    // Redirect to login or dashboard
    router.push('/auth/login');
  } catch {
    // Error handled in store
  }
}
</script>
