<script setup lang="ts">
import type { FormError, FormSubmitEvent, SelectItem, TabsItem } from '@nuxt/ui';
import type { Application } from '~/interfaces/application.interface';
import type { Program } from '~/interfaces/programs.interface';
import { useApplicationStore } from '~/stores/application.store';
import { apiFetch } from '~/utils/api-fetch';

useSeoMeta({
  title: 'Application',
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
const applicationId = computed(() => Number(route.params.applicationId));

if (!Number.isFinite(programId.value) || !Number.isFinite(applicationId.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Application not found' });
}

const applicationStore = useApplicationStore();

const { data: program } = await useAsyncData(`program-${programId.value}`, () =>
  apiFetch<Program>(`/programs/single/${programId.value}`),
);

const {
  data: loaded,
  status: loadStatus,
  error: loadError,
  refresh: refreshApplication,
} = await useAsyncData(`application-${applicationId.value}`, () =>
  apiFetch<Application>(`/applications/single/${applicationId.value}`),
);

const state = reactive<Application>({
  programId: programId.value,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  nin: '',
  dob: '',
  gender: '',
  village: '',
  lga: '',
  state: '',
  address: '',
  ekpuk: '',
  country: '',
  school: '',
  faculty: '',
  department: '',
  regNo: '',
  level: undefined,
  programDuration: undefined,
  admissionLeterUrl: '',
  lastSchoolFeeReceiptUrl: '',
  certificateOfOriginUrl: '',
  ssceResultUrl: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  passportUrl: '',
});

watchEffect(() => {
  if (!loaded.value) return;
  Object.assign(state, loaded.value);
  state.programId = programId.value;
});

const genderItems: SelectItem[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const tabs = [
  { label: 'Personal', slot: 'personal' },
  { label: 'Education', slot: 'education' },
  { label: 'Bank', slot: 'bank' },
  { label: 'Documents', slot: 'documents' },
] satisfies TabsItem[];

function validate(data: Partial<Application>): FormError[] {
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

async function onSave(event: FormSubmitEvent<Application>) {
  await applicationStore.updateApplication(applicationId.value, event.data);
  await refreshApplication();
}
</script>

<template>
  <UContainer class="py-8">
    <UCard v-if="loadError">
      <template #header>
        <h1 class="text-2xl font-semibold">Application</h1>
      </template>
      <p class="text-sm text-muted">
        {{ getErrorMessage(loadError, 'Failed to load application.') }}
      </p>
    </UCard>

    <UCard v-else-if="loadStatus === 'pending'">
      <p class="text-sm text-muted">Loading…</p>
    </UCard>

    <div v-else class="space-y-6">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">{{ program?.name || 'Application' }}</h1>
            <p class="text-sm text-muted">
              Application ID: {{ applicationId }}
              <span v-if="loaded?.applicationNo"> • {{ loaded.applicationNo }}</span>
            </p>
          </div>
        </template>

        <UForm :state="state" :validate="validate" class="space-y-4" @submit="onSave">
          <UTabs :items="tabs" class="w-full">
            <template #personal>
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
                  <UInput v-model="state.nin" class="w-full" disabled />
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

                <UFormField label="Address" name="address">
                  <UInput v-model="state.address" class="w-full" />
                </UFormField>

                <UFormField label="State" name="state">
                  <UInput v-model="state.state" class="w-full" />
                </UFormField>

                <UFormField label="LGA" name="lga">
                  <UInput v-model="state.lga" class="w-full" />
                </UFormField>

                <UFormField label="Village" name="village">
                  <UInput v-model="state.village" class="w-full" />
                </UFormField>
              </div>
            </template>

            <template #education>
              <div class="grid gap-4 sm:grid-cols-2">
                <UFormField label="School" name="school">
                  <UInput v-model="state.school" class="w-full" />
                </UFormField>

                <UFormField label="Faculty" name="faculty">
                  <UInput v-model="state.faculty" class="w-full" />
                </UFormField>

                <UFormField label="Department" name="department">
                  <UInput v-model="state.department" class="w-full" />
                </UFormField>

                <UFormField label="Reg. No" name="regNo">
                  <UInput v-model="state.regNo" class="w-full" />
                </UFormField>

                <UFormField label="Level" name="level">
                  <UInput v-model="state.level" type="number" class="w-full" />
                </UFormField>

                <UFormField label="Program duration (years)" name="programDuration">
                  <UInput v-model="state.programDuration" type="number" class="w-full" />
                </UFormField>
              </div>
            </template>

            <template #bank>
              <div class="grid gap-4 sm:grid-cols-2">
                <UFormField label="Bank name" name="bankName">
                  <UInput v-model="state.bankName" class="w-full" />
                </UFormField>

                <UFormField label="Account number" name="accountNumber">
                  <UInput v-model="state.accountNumber" class="w-full" />
                </UFormField>

                <UFormField label="Account name" name="accountName">
                  <UInput v-model="state.accountName" class="w-full" />
                </UFormField>
              </div>
            </template>

            <template #documents>
              <div class="space-y-4">
                <UFormField label="Passport photo URL" name="passportUrl">
                  <UInput v-model="state.passportUrl" class="w-full" />
                </UFormField>

                <UFormField label="Admission letter URL" name="admissionLeterUrl">
                  <UInput v-model="state.admissionLeterUrl" class="w-full" />
                </UFormField>

                <UFormField label="Last school fee receipt URL" name="lastSchoolFeeReceiptUrl">
                  <UInput v-model="state.lastSchoolFeeReceiptUrl" class="w-full" />
                </UFormField>

                <UFormField label="Certificate of origin URL" name="certificateOfOriginUrl">
                  <UInput v-model="state.certificateOfOriginUrl" class="w-full" />
                </UFormField>

                <UFormField label="SSCE result URL" name="ssceResultUrl">
                  <UInput v-model="state.ssceResultUrl" class="w-full" />
                </UFormField>
              </div>
            </template>
          </UTabs>

          <UCard v-if="applicationStore.error" variant="soft">
            <p class="text-sm text-muted">{{ applicationStore.error }}</p>
          </UCard>

          <div class="flex items-center justify-end">
            <UButton type="submit" loading-auto> Save </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>
