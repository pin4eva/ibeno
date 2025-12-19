<template>
  <NuxtLayout name="auth">
    <template #title> Update your password </template>
    <template #subtitle>
      Please check your email for the OTP code and enter it below to set your new password.
    </template>

    <form class="grid gap-2" @submit.prevent="handleUpdatePassword">
      <UFormField label="OTP Code" name="otp">
        <UInput
          :disabled="!!route.query?.otp"
          v-model="form.otp"
          type="number"
          placeholder="123456"
          required
        />
      </UFormField>

      <UFormField label="New Password" name="password">
        <UInput v-model="form.password" type="password" required placeholder="********" />
      </UFormField>

      <UFormField label="Confirm Password" name="confirmPassword">
        <UInput v-model="form.confirmPassword" type="password" required placeholder="********" />
      </UFormField>

      <div v-if="passwordMismatch" class="text-red-500 text-sm">Passwords do not match</div>

      <div>
        <UButton type="submit" block :loading="authStore.loading"> Update Password </UButton>
      </div>

      <div class="text-sm text-center">
        <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
          Back to sign in
        </NuxtLink>
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
const route = useRoute();

const otpQuery = route.query.otp;
const initialOtp = Array.isArray(otpQuery) ? otpQuery[0] : otpQuery;

const form = reactive({
  otp: (initialOtp as string) || '',
  password: '',
  confirmPassword: '',
});

const passwordMismatch = computed(() => {
  return form.password && form.confirmPassword && form.password !== form.confirmPassword;
});

async function handleUpdatePassword() {
  if (passwordMismatch.value) return;

  try {
    const response = await authStore.resetPassword({
      otp: Number(form.otp),
      password: form.password,
    });

    if (response?.success) {
      router.push('/auth/login');
    }
  } catch (error) {
    console.log(error);
    // Error handled in store
  }
}
</script>
