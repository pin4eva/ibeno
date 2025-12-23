<script setup lang="ts">
import { useBidStore } from '~/stores/procurement/bid.store';
import { useAuthStore } from '~/stores/auth.store';

const props = defineProps<{
  procurementId: number;
  procurementTitle: string;
}>();

const open = defineModel<boolean>();

const emit = defineEmits(['close', 'success']);

const bidStore = useBidStore();
const authStore = useAuthStore();
const toast = useToast();

const form = reactive({
  contractorNo: '',
  amount: 0,
  notes: '',
  proposal: null as File | null,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
});

const isSubmitting = ref(false);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    form.proposal = files[0] || null;
  }
};

const submitBid = async () => {
  if (!form.contractorNo) {
    toast.add({ title: 'Error', description: 'Contractor Number is required', color: 'error' });
    return;
  }
  if (form.amount <= 0) {
    toast.add({ title: 'Error', description: 'Amount must be greater than 0', color: 'error' });
    return;
  }
  if (!form.proposal) {
    toast.add({ title: 'Error', description: 'Please upload a proposal document', color: 'error' });
    return;
  }

  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('amount', form.amount.toString());
    formData.append('notes', form.notes);
    formData.append('contactName', form.contactName);
    formData.append('contactEmail', form.contactEmail);
    formData.append('contactPhone', form.contactPhone);
    formData.append('proposal', form.proposal);
    formData.append('contractorNo', form.contractorNo);

    await bidStore.submitBid(props.procurementId, formData);
    toast.add({ title: 'Success', description: 'Bid submitted successfully', color: 'success' });
    emit('success');
    open.value = false;
  } catch (error: unknown) {
    const err = error as Error;
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to submit bid',
      color: 'error',
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'max-w-2xl' }"
    :title="`Submit Bid: ${procurementTitle}`"
    :description="`Fill in the details below to submit your proposal for ${procurementTitle}.`"
  >
    <template #body>
      <form id="bid-form" @submit.prevent="submitBid" class="space-y-4">
        <UFormField
          label="Contractor Number"
          name="contractorNo"
          required
          help="Your official registration number"
        >
          <UInput v-model="form.contractorNo" placeholder="e.g. CON-2023-001" />
        </UFormField>

        <UFormField label="Bid Amount" name="amount" required>
          <UInput
            v-model="form.amount"
            type="number"
            step="0.01"
            icon="i-heroicons-banknotes"
            placeholder="0.00"
          />
        </UFormField>

        <UFormField label="Proposal Document (PDF/DOC)" name="proposal" required>
          <UInput
            type="file"
            icon="i-heroicons-document-arrow-up"
            @change="handleFileUpload"
            accept=".pdf,.doc,.docx"
          />
        </UFormField>

        <UFormField label="Contact Person" name="contactName" required>
          <UInput v-model="form.contactName" placeholder="Full Name" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Contact Email" name="contactEmail" required>
            <UInput v-model="form.contactEmail" type="email" placeholder="email@company.com" />
          </UFormField>
          <UFormField label="Contact Phone" name="contactPhone" required>
            <UInput v-model="form.contactPhone" placeholder="+234..." />
          </UFormField>
        </div>

        <UFormField label="Additional Notes (Optional)" name="notes">
          <UTextarea v-model="form.notes" :rows="3" placeholder="Any additional information..." />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="bid-form" color="primary" :loading="isSubmitting">
          Submit Bid
        </UButton>
      </div>
    </template>
  </UModal>
</template>
