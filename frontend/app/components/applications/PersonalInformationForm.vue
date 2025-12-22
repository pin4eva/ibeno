<script lang="ts" setup>
import { z } from 'zod';
import type { FetchError } from '~/interfaces/app.interface';
import { GenderEnum, genderOptions } from '~/interfaces/application.interface';
import { useApplicationStore } from '~/stores/application.store';
import { toDateInput, toIsoDateTime } from '~/utils/date';

const applicationStore = useApplicationStore();

const application = computed(() => applicationStore?.application || null);
const emit = defineEmits<{
  stepComplete: [step: string];
}>();

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.email(),
  phone: z.string().length(11),
  nin: z.string().length(11, 'NIN must be 11 characters'),
  dob: z.iso.date(),
  state: z.enum(nigerianStates.map((state) => state.state)),
  lga: z.enum(nigerianStates.flatMap((state) => state.lgas)),
  village: z.string(),
  ekpuk: z.string().min(5, 'Ekpuk is required'),
  address: z.string().min(5, 'Address is required'),
  gender: z.enum(['Male', 'Female']),
});

type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  firstName: application.value?.firstName || '',
  lastName: application.value?.lastName || '',
  middleName: application.value?.middleName || '',
  email: application.value?.email || '',
  phone: application.value?.phone || '',
  nin: application.value?.nin || '',
  dob: toDateInput(application.value?.dob),
  state: application.value?.state || '',
  lga: application.value?.lga || '',
  village: application.value?.village || '',
  address: application.value?.address || '',
  ekpuk: application.value?.ekpuk || '',
  gender: (application.value?.gender as GenderEnum) || GenderEnum.Male,
});

const stateOptions = nigerianStates.map((state) => ({
  label: state.state,
  value: state.state,
}));

const lgaOptions = computed(() => {
  const selectedState = nigerianStates.find((s) => s.state === state.state);
  if (!selectedState) return [];
  return selectedState.lgas.map((lga) => ({
    label: lga,
    value: lga,
  }));
});

watch(
  () => state.state,
  () => {
    state.lga = '';
  },
);

const isLoading = ref(false);
const isUploadingPassport = ref(false);
const toast = useToast();

const handlePassportUpload = async (files: FileList | null) => {
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file) return;

  if (!application.value?.id) {
    toast.add({ title: 'Error', description: 'Application ID is missing', color: 'red' });
    return;
  }

  isUploadingPassport.value = true;
  try {
    const url = await applicationStore.uploadFile(file);
    await applicationStore.uploadPassport(application.value.id, url);
    toast.add({ title: 'Success', description: 'Passport uploaded successfully', color: 'green' });
    applicationStore.setApplication({
      ...application.value,
      passport: url,
    });
  } catch (er) {
    const error = er as FetchError;
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'Failed to upload passport',
      color: 'red',
    });
  } finally {
    isUploadingPassport.value = false;
  }
};

const handleSubmit = async () => {
  if (!application.value?.id) {
    throw new Error('Application ID is required');
  }
  if (!application.value.passport) {
    toast.add({ title: 'Error', description: 'Passport photograph is required', color: 'red' });
    return;
  }
  isLoading.value = true;

  await applicationStore
    .updateApplication({
      id: application.value.id,
      ...application.value,
      ...state,
      dob: toIsoDateTime(state.dob),
    })
    .then(() => {
      emit('stepComplete', 'education');
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>
<template>
  <UForm :schema="schema" :state="state" @submit="handleSubmit">
    <div class="mb-6 flex flex-col items-center gap-4 sm:flex-row">
      <div
        class="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-50"
      >
        <img
          v-if="application?.passport"
          :src="application.passport"
          alt="Passport"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
          <UIcon name="i-lucide-user" class="h-12 w-12" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-medium">Passport Photograph <span class="text-red-500">*</span></p>
        <p class="text-sm text-muted">Upload a clear passport photograph. Max size 2MB.</p>
        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="solid"
            icon="i-lucide-upload"
            :loading="isUploadingPassport"
            @click="$refs.passportInput.click()"
          >
            {{ application?.passport ? 'Change Photo' : 'Upload Photo' }}
          </UButton>
          <input
            ref="passportInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="(e) => handlePassportUpload((e.target as HTMLInputElement).files)"
          />
        </div>
      </div>
    </div>

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
          v-model="state.gender as GenderEnum"
          :items="genderOptions"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField label="State" name="state" required>
        <USelect v-model="state.state" :items="stateOptions" value-key="value" class="w-full" />
      </UFormField>

      <UFormField label="LGA" name="lga" required>
        <USelect
          :disabled="!state.state"
          v-model="state.lga"
          :items="lgaOptions"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Village" name="village" required>
        <UInput v-model="state.village" class="w-full" />
      </UFormField>
      <UFormField label="Ekpuk" name="ekpuk" required>
        <UInput v-model="state.ekpuk" class="w-full" />
      </UFormField>
    </div>
    <UFormField label="Address" name="address" required>
      <UTextarea v-model="state.address" class="w-full" />
    </UFormField>
    <div class="flex justify-end">
      <UButton
        type="submit"
        class="mt-4 col-span-2"
        :loading="isLoading"
        :disabled="isLoading || !application?.passport"
      >
        Save and Continue
      </UButton>
    </div>
  </UForm>
</template>
