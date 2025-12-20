<script lang="ts" setup>
import { z } from 'zod';
import type { Application } from '~/interfaces/application.interface';
import { ApplicationStatusEnum } from '~/interfaces/application.interface';
import { nigerianBanks } from '~/utils/nigerian-banks';

const props = defineProps<{
  application?: Partial<Application> | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  stepComplete: [step: string];
}>();

const showAlert = ref(true);

const schema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),
  accountName: z.string().min(2, 'Account name is required'),
});

const state = reactive<z.infer<typeof schema>>({
  bankName: props?.application?.bankName || '',
  accountNumber: props?.application?.accountNumber || '',
  accountName: props?.application?.accountName || '',
} satisfies z.infer<typeof schema>);

const bankOptions = nigerianBanks.map((bank) => ({
  label: bank.name,
  value: bank.name,
}));

const isLoading = ref(false);
const canSubmit = computed(() => schema.safeParse(state).success);

const handleSubmit = async () => {
  if (!props.application?.id) {
    throw new Error('Application ID is required');
  }
  isLoading.value = true;
  const applicationStore = useApplicationStore();

  try {
    // Update bank details and set status to Submitted
    await applicationStore.updateApplication({
      id: props.application.id,
      ...props.application,
      ...state,
      programId: props.application.programId,
      accountName: String(state.accountName),
      accountNumber: String(state.accountNumber),
      status: ApplicationStatusEnum.Submitted,
    });

    emit('stepComplete', 'bank');
  } finally {
    isLoading.value = false;
  }
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
      <UFormField label="Bank name" name="bankName" required>
        <USelectMenu
          v-model="state.bankName"
          :items="bankOptions"
          value-key="value"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>

      <UFormField label="Account number" name="accountNumber" required>
        <UInput type="number" v-model="state.accountNumber" class="w-full" :disabled="disabled" />
      </UFormField>

      <UFormField label="Account name" name="accountName" required>
        <UInput v-model="state.accountName" class="w-full" :disabled="disabled" />
      </UFormField>
    </div>
    <UAlert
      v-if="showAlert && !disabled"
      color="warning"
      variant="soft"
      title="Heads up!"
      icon="i-lucide-terminal"
      class="my-6"
    >
      <template #description>
        <p class="text-lg italic">
          You are about to submit your bank details. Ensure that the information provided is
          accurate to avoid any payment issues. This is the last step, once submitted, you won't be
          able to make changes. Ensure you have the right information across the steps.
        </p>
        <div class="flex justify-end">
          <UButton variant="soft" color="info" size="sm" class="mt-4" @click="showAlert = false"
            >Dismiss</UButton
          >
          <UButton
            variant="soft"
            color="error"
            size="sm"
            class="mt-4 ml-2"
            @click="handleSubmit()"
            :loading="isLoading"
            :disabled="isLoading || !canSubmit"
            >Proceed to Submit</UButton
          >
        </div>
      </template>
    </UAlert>

    <div class="flex justify-end mt-4">
      <UButton type="submit" :loading="isLoading" :disabled="disabled || isLoading || !canSubmit">
        Submit Application
      </UButton>
    </div>
  </UForm>
</template>
