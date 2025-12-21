<script lang="ts" setup>
import { z } from 'zod';
import type { BankDetail } from '~/interfaces/application.interface';
import { nigerianBanks } from '~/utils/nigerian-banks';

const props = defineProps<{
  applicationId: number;
  bankDetails?: BankDetail;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  stepComplete: [step: string];
}>();

const schema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountNo: z.string().regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),
  accountName: z.string().min(10, 'Please enter a valid account name'),
});

const state = reactive<z.infer<typeof schema>>({
  bankName: props?.bankDetails?.bankName || '',
  accountNo: props?.bankDetails?.accountNo || '',
  accountName: props?.bankDetails?.accountName || '',
} satisfies z.infer<typeof schema>);

const bankOptions = nigerianBanks.map((bank) => ({
  label: bank.name,
  value: bank.name,
}));

const isLoading = ref(false);
// const canSubmit = computed(() => schema.safeParse(state).success);

const handleSubmit = async () => {
  if (!props.applicationId) {
    throw new Error('Application ID is required');
  }
  isLoading.value = true;
  const applicationStore = useApplicationStore();

  try {
    // Update bank details and set status to Submitted
    await applicationStore.updateBankDetails({
      applicationId: props.applicationId,
      ...props.bankDetails,
      ...state,
      accountName: String(state.accountName),
      accountNo: String(state.accountNo),
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

      <UFormField label="Account number" name="accountNo" required>
        <UInput
          type="text"
          inputmode="numeric"
          maxlength="10"
          v-model="state.accountNo"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>

      <UFormField label="Account name" name="accountName" required>
        <UInput v-model="state.accountName" class="w-full" :disabled="disabled" />
      </UFormField>
    </div>

    <div class="flex justify-end mt-4">
      <UButton type="submit" :loading="isLoading" :disabled="disabled || isLoading">
        Submit Application
      </UButton>
    </div>
  </UForm>
</template>
