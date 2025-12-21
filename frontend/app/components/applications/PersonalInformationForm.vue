<script lang="ts" setup>
import { z } from 'zod';
import { GenderEnum, genderOptions, type Application } from '~/interfaces/application.interface';
import { useApplicationStore } from '~/stores/application.store';
import { toDateInput, toIsoDateTime } from '~/utils/date';

const applicationStore = useApplicationStore();

const props = defineProps<{ application?: Application | null }>();
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
  firstName: props?.application?.firstName || '',
  lastName: props?.application?.lastName || '',
  middleName: props?.application?.middleName || '',
  email: props?.application?.email || '',
  phone: props?.application?.phone || '',
  nin: props?.application?.nin || '',
  dob: toDateInput(props?.application?.dob),
  state: props?.application?.state || '',
  lga: props?.application?.lga || '',
  village: props?.application?.village || '',
  address: props?.application?.address || '',
  ekpuk: props?.application?.ekpuk || '',
  gender: (props?.application?.gender as GenderEnum) || GenderEnum.Male,
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
const canSubmit = computed(() => schema.safeParse(state).success);

const handleSubmit = async () => {
  if (!props.application?.id) {
    throw new Error('Application ID is required');
  }
  isLoading.value = true;

  await applicationStore
    .updateApplication({
      id: props.application.id,
      ...props.application,
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
        :disabled="isLoading || !canSubmit"
      >
        Save and Continue
      </UButton>
    </div>
  </UForm>
</template>
