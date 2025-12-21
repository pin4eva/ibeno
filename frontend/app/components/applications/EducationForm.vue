<script lang="ts" setup>
import { z } from 'zod';
import type { SchoolRecord } from '~/interfaces/application.interface';
import { useApplicationStore } from '~/stores/application.store';

const props = defineProps<{
  schoolRecord?: Partial<SchoolRecord> | null;
  applicationId: number;
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
  school: props?.schoolRecord?.school || '',
  faculty: props?.schoolRecord?.faculty || '',
  department: props?.schoolRecord?.department || '',
  regNo: props?.schoolRecord?.regNo || '',
  level: props?.schoolRecord?.level || 0,
  programDuration: props?.schoolRecord?.programDuration || 0,
});

const isLoading = ref(false);

const handleSubmit = async () => {
  if (!props.applicationId) {
    throw new Error('School record ID is required');
  }
  isLoading.value = true;
  const result = await applicationStore.updateSchoolRecord({
    applicationId: props.applicationId,
    ...props.schoolRecord,
    ...state,
  });
  if (result) {
    emit('stepComplete', 'education');
  }
  isLoading.value = false;
};
</script>
<template>
  <UForm :schema="schema" :state="state" @submit="handleSubmit">
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
    <div class="flex justify-end mt-4">
      <UButton type="submit"> Save </UButton>
    </div>
  </UForm>
</template>
