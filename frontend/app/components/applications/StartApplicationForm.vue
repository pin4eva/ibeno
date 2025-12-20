<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui';
import { z } from 'zod';
import { GenderEnum, genderOptions } from '~/interfaces/application.interface';
import { useApplicationStore } from '~/stores/application.store';

const props = defineProps<{ programId: number }>();

const emit = defineEmits<{
  (e: 'completed', payload: { applicationNo: string | null }): void;
}>();

const applicationStore = useApplicationStore();

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.email(),
  phone: z.string().length(11),
  nin: z.string().length(11, 'NIN must be 11 characters'),
  dob: z.iso.date(),
  gender: z.enum(GenderEnum),
});

type Schema = z.output<typeof schema>;
const state = reactive<Schema & { programId: number }>({
  programId: props.programId,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  nin: '',
  dob: '',
  gender: GenderEnum.Male,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const res = await applicationStore.startApplication({
    ...event.data,
    programId: props.programId,
    middleName: event.data.middleName?.trim() ? event.data.middleName : undefined,
  });

  emit('completed', { applicationNo: res.applicationNo ?? null });
}
</script>
<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
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
        <USelect v-model="state.gender" :items="genderOptions" value-key="value" class="w-full" />
      </UFormField>
    </div>

    <UCard v-if="applicationStore.error" variant="soft">
      <p class="text-sm text-red-500">{{ applicationStore.error }}</p>
    </UCard>

    <div class="flex items-center justify-end">
      <UButton type="submit" loading-auto> Start Application </UButton>
    </div>
  </UForm>
</template>
