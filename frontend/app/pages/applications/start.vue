<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const route = useRoute();
const router = useRouter();
const applicationStore = useApplicationStore();
const toast = useToast();

const programId = computed(() => parseInt(route.query.programId as string) || 0);

const state = reactive<{
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  nin: string;
  dob: string;
  gender: 'Male' | 'Female' | undefined;
  programId: number;
}>({
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  nin: '',
  dob: '',
  gender: undefined,
  programId: programId.value,
});

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  nin: z.string().min(11, 'NIN must be at least 11 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female']),
});

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await applicationStore.startApplication({
      ...event.data,
      programId: programId.value,
    });
    router.push('/applications/success');
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'red' });
  }
}
</script>

<template>
  <UContainer class="py-10">
    <UCard class="max-w-2xl mx-auto">
      <template #header>
        <h1 class="text-2xl font-bold">Start Application</h1>
        <p class="text-gray-500">Please fill in your personal details to begin.</p>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="First Name" name="firstName">
            <UInput v-model="state.firstName" />
          </UFormGroup>
          <UFormGroup label="Last Name" name="lastName">
            <UInput v-model="state.lastName" />
          </UFormGroup>
          <UFormGroup label="Middle Name" name="middleName">
            <UInput v-model="state.middleName" />
          </UFormGroup>
          <UFormGroup label="Gender" name="gender">
            <USelect v-model="state.gender" :options="['Male', 'Female']" />
          </UFormGroup>
        </div>

        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Phone Number" name="phone">
          <UInput v-model="state.phone" />
        </UFormGroup>

        <UFormGroup label="NIN" name="nin">
          <UInput v-model="state.nin" />
        </UFormGroup>

        <UFormGroup label="Date of Birth" name="dob">
          <UInput v-model="state.dob" type="date" />
        </UFormGroup>

        <div class="pt-4">
          <UButton type="submit" block :loading="applicationStore.loading">
            Start Application
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
