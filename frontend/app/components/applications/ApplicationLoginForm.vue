<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types';
import { z } from 'zod';
import type { FetchError } from '~/interfaces/app.interface';

const props = defineProps<{ onLoginSuccess?: () => void }>();

const router = useRouter();
const { loading, loginApplicant } = useApplicationStore();
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
    const app = await loginApplicant(event.data);

    if (app && app.id) {
      props.onLoginSuccess?.();
      router.push(`/applications`);
    }
  } catch (e) {
    const error = e as FetchError;
    toast.add({ title: 'Error', description: error?.data?.message, color: 'red' });
  }
}
</script>
<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Application Number" name="applicationNo">
      <UInput v-model="state.applicationNo" placeholder="APP-..." />
    </UFormField>

    <UFormField label="NIN" name="nin">
      <UInput v-model="state.nin" type="password" />
    </UFormField>

    <div class="pt-4">
      <UButton type="submit" block :loading="loading"> Login </UButton>
    </div>
  </UForm>
</template>
