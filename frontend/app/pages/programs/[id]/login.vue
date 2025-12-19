<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui';
import type { ApplicantLogin } from '~/interfaces/application.interface';
import { useApplicationStore } from '~/stores/application.store';

useSeoMeta({
  title: 'Continue application',
});

const route = useRoute();
const programId = computed(() => Number(route.params.id));

if (!Number.isFinite(programId.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found' });
}

const applicationNoQuery = computed(() => {
  const raw = route.query.applicationNo;
  if (Array.isArray(raw)) return raw[0];
  return raw;
});

const applicationStore = useApplicationStore();

const state = reactive<ApplicantLogin>({
  applicationNo: typeof applicationNoQuery.value === 'string' ? applicationNoQuery.value : '',
  nin: '',
});

function validate(data: Partial<ApplicantLogin>): FormError[] {
  const errors: FormError[] = [];
  if (!data.applicationNo?.trim()) errors.push({ name: 'applicationNo', message: 'Required' });
  if (!data.nin?.trim()) errors.push({ name: 'nin', message: 'Required' });
  return errors;
}

async function onSubmit(event: FormSubmitEvent<ApplicantLogin>) {
  const app = await applicationStore.loginApplicant(event.data);
  if (!app.id) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Application ID missing from login response',
    });
  }

  await navigateTo(`/programs/${programId.value}/applications/${app.id}`);
}
</script>

<template>
  <UContainer class="py-8">
    <UCard class="max-w-xl">
      <template #header>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold">Continue application</h1>
          <p class="text-sm text-muted">Login with your Application No and NIN.</p>
        </div>
      </template>

      <UForm :state="state" :validate="validate" class="space-y-4" @submit="onSubmit">
        <UFormField label="Application No" name="applicationNo" required>
          <UInput v-model="state.applicationNo" class="w-full" />
        </UFormField>

        <UFormField label="NIN" name="nin" required>
          <UInput v-model="state.nin" class="w-full" />
        </UFormField>

        <UCard v-if="applicationStore.error" variant="soft">
          <p class="text-sm text-muted">{{ applicationStore.error }}</p>
        </UCard>

        <div class="flex items-center justify-end">
          <UButton type="submit" loading-auto> Login </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
