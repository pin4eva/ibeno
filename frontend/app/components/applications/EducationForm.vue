<script lang="ts" setup>
import { z } from 'zod';
import type { Application } from '~/interfaces/application.interface';
import { useApplicationStore } from '~/stores/application.store';

const props = defineProps<{
  application?: Partial<Application> | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  stepComplete: [step: string];
}>();

const applicationStore = useApplicationStore();

const schema = z.object({
  school: z.string().min(2, 'School is required'),
  faculty: z.string().min(2, 'Faculty is required'),
  department: z.string().min(2, 'Department is required'),
  regNo: z.string().min(2, 'Registration number is required'),
  level: z.number().min(1, 'Level is required'),
  programDuration: z.number().min(1, 'Program duration is required'),
});

type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  school: props?.application?.school || '',
  faculty: props?.application?.faculty || '',
  department: props?.application?.department || '',
  regNo: props?.application?.regNo || '',
  level: props?.application?.level || 0,
  programDuration: props?.application?.programDuration || 0,
});

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
      programId: props.application.programId,
      ...props.application,
      ...state,
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
    <UAlert v-if="disabled" color="warning" variant="soft" class="mb-4">
      <template #description>
        Please complete the previous step before editing this section.
      </template>
    </UAlert>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="School" name="school" required>
        <UInput v-model="state.school" class="w-full" :disabled="disabled" />
      </UFormField>

      <UFormField label="Faculty" name="faculty" required>
        <UInput v-model="state.faculty" class="w-full" :disabled="disabled" />
      </UFormField>

      <UFormField label="Department" name="department" required>
        <UInput v-model="state.department" class="w-full" :disabled="disabled" />
      </UFormField>

      <UFormField label="Reg. No" name="regNo" required>
        <UInput v-model="state.regNo" class="w-full" :disabled="disabled" />
      </UFormField>

      <UFormField label="Level" name="level" required>
        <UInput v-model="state.level" type="number" class="w-full" :disabled="disabled" />
      </UFormField>

      <UFormField label="Program duration (years)" name="programDuration" required>
        <UInput v-model="state.programDuration" type="number" class="w-full" :disabled="disabled" />
      </UFormField>
    </div>
    <div class="flex justify-end mt-4">
      <UButton type="submit" :loading="isLoading" :disabled="disabled || isLoading || !canSubmit">
        Save and Continue
      </UButton>
    </div>
  </UForm>
</template>
