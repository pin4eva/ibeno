<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const router = useRouter();
const applicationStore = useApplicationStore();
const toast = useToast();

const state = reactive({
  applicationNo: '',
  nin: '',
});

const schema = z.object({
  applicationNo: z.string().min(1, 'Application Number is required'),
  nin: z.string().min(1, 'NIN is required'),
});

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const app = await applicationStore.loginApplicant(event.data);
    if (app && app.id) {
      router.push(`/applications/${app.id}`);
    }
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'red' });
  }
}
</script>

<template>
  <UContainer class="py-20">
    <UCard class="max-w-md mx-auto">
      <template #header>
        <h1 class="text-2xl font-bold text-center">Applicant Login</h1>
        <p class="text-gray-500 text-center">Enter your Application No. and NIN</p>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Application Number" name="applicationNo">
          <UInput v-model="state.applicationNo" placeholder="APP-..." />
        </UFormGroup>

        <UFormGroup label="NIN" name="nin">
          <UInput v-model="state.nin" type="password" />
        </UFormGroup>

        <div class="pt-4">
          <UButton type="submit" block :loading="applicationStore.loading"> Login </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
