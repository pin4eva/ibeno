<script setup lang="ts">
import type { FormError, FormSubmitEvent, SelectItem } from '@nuxt/ui';
import type { Program } from '~/interfaces/programs.interface';
import { useApplicationStore, type StartApplicationInput } from '~/stores/application.store';
import { apiFetch } from '~/utils/api-fetch';
import { sanitizeHtml } from '~/utils/html';

useSeoMeta({
  title: 'Program',
});

type ErrorWithMessage = { message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

const route = useRoute();
const programId = computed(() => Number(route.params.id));

if (!Number.isFinite(programId.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found' });
}

const {
  data: program,
  status: programStatus,
  error: programError,
} = await useAsyncData(`program-${programId.value}`, () =>
  apiFetch<Program>(`/programs/single/${programId.value}`),
);

const applicationStore = useApplicationStore();
const started = ref(false);
const startedApplicationNo = ref<string | null>(null);

const state = reactive<StartApplicationInput>({
  programId: programId.value,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  nin: '',
  dob: '',
  gender: '',
});

const genderItems: SelectItem[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

function validate(data: Partial<StartApplicationInput>): FormError[] {
  const errors: FormError[] = [];

  if (!data.firstName?.trim()) errors.push({ name: 'firstName', message: 'Required' });
  if (!data.lastName?.trim()) errors.push({ name: 'lastName', message: 'Required' });
  if (!data.email?.trim()) errors.push({ name: 'email', message: 'Required' });
  if (!data.phone?.trim()) errors.push({ name: 'phone', message: 'Required' });
  if (!data.nin?.trim()) errors.push({ name: 'nin', message: 'Required' });
  if (!data.dob?.trim()) errors.push({ name: 'dob', message: 'Required' });
  if (!data.gender?.trim()) errors.push({ name: 'gender', message: 'Required' });

  return errors;
}

async function onSubmit(event: FormSubmitEvent<StartApplicationInput>) {
  const res = await applicationStore.startApplication({
    ...event.data,
    programId: programId.value,
    middleName: event.data.middleName?.trim() ? event.data.middleName : undefined,
  });

  started.value = true;
  startedApplicationNo.value = res.applicationNo ?? null;
}
</script>

<template>
  <UContainer class="py-8">
    <UCard v-if="programError">
      <template #header>
        <h1 class="text-2xl font-semibold">Program</h1>
      </template>
      <p class="text-sm text-muted">
        {{ getErrorMessage(programError, 'Failed to load program.') }}
      </p>
    </UCard>

    <UCard v-else-if="programStatus === 'pending'">
      <p class="text-sm text-muted">Loading…</p>
    </UCard>

    <div v-else-if="program" class="space-y-6">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">{{ program.name }}</h1>
            <p class="text-sm text-muted">
              {{ program.category }}
              <span v-if="program.subCategory"> • {{ program.subCategory }}</span>
            </p>
          </div>
        </template>

        <div
          v-if="program.description"
          class="text-sm text-muted"
          v-html="sanitizeHtml(program.description)"
        />
      </UCard>

      <UCard v-if="started">
        <template #header>
          <h2 class="text-lg font-semibold">Application started</h2>
        </template>

        <p class="text-sm text-muted">
          We’ve sent your login credentials to your email. Use your Application No as the username
          and your NIN as the password.
        </p>

        <div class="mt-4 flex items-center justify-end">
          <UButton
            :to="{
              path: `/programs/${programId}/login`,
              query: startedApplicationNo ? { applicationNo: startedApplicationNo } : {},
            }"
          >
            Continue Application
          </UButton>
        </div>
      </UCard>

      <UCard v-else>
        <template #header>
          <h2 class="text-lg font-semibold">Start application</h2>
        </template>

        <UForm :state="state" :validate="validate" class="space-y-4" @submit="onSubmit">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="First name" name="firstName" required>
              <UInput v-model="state.firstName" class="w-full" />
            </UFormField>

            <UFormField label="Last name" name="lastName" required>
              <UInput v-model="state.lastName" class="w-full" />
            </UFormField>

            <UFormField label="Middle name" name="middleName">
              <UInput v-model="state.middleName" class="w-full" />
            </UFormField>

            <UFormField label="Email" name="email" required>
              <UInput v-model="state.email" type="email" class="w-full" />
            </UFormField>

            <UFormField label="Phone" name="phone" required>
              <UInput v-model="state.phone" class="w-full" />
            </UFormField>

            <UFormField label="NIN" name="nin" required>
              <UInput v-model="state.nin" class="w-full" />
            </UFormField>

            <UFormField label="Date of birth" name="dob" required>
              <UInput v-model="state.dob" type="date" class="w-full" />
            </UFormField>

            <UFormField label="Gender" name="gender" required>
              <USelect
                v-model="state.gender"
                :items="genderItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>
          </div>

          <UCard v-if="applicationStore.error" variant="soft">
            <p class="text-sm text-muted">{{ applicationStore.error }}</p>
          </UCard>

          <div class="flex items-center justify-end">
            <UButton type="submit" loading-auto> Start Application </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>
