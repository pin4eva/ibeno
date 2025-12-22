<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create Procurement</h2>
        <p class="text-sm text-gray-500 mt-1">Fill in the details to create a new procurement</p>
      </div>
      <UButton
        icon="i-lucide-arrow-left"
        color="gray"
        variant="ghost"
        label="Back"
        to="/admin/procurements"
      />
    </div>

    <UCard>
      <UForm :state="formState" @submit="handleSubmit">
        <div class="space-y-6">
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-medium mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Title" name="title" required>
                <UInput v-model="formState.title" placeholder="Enter procurement title" />
              </UFormField>

              <UFormField label="Reference Number" name="referenceNo">
                <UInput
                  v-model="formState.referenceNo"
                  placeholder="Auto-generated if blank"
                />
              </UFormField>

              <UFormField label="Category" name="category" required>
                <USelectMenu
                  v-model="formState.category"
                  :items="categoryOptions"
                  placeholder="Select category"
                  value-key="value"
                />
              </UFormField>

              <UFormField label="Type" name="type" required>
                <USelectMenu
                  v-model="formState.type"
                  :items="typeOptions"
                  placeholder="Select type"
                  value-key="value"
                />
              </UFormField>

              <UFormField label="Location" name="location" required>
                <USelectMenu
                  v-model="formState.location"
                  :items="locationOptions"
                  placeholder="Select location"
                  value-key="value"
                />
              </UFormField>

              <UFormField label="Budget Estimate" name="budgetEstimate">
                <UInput
                  v-model.number="formState.budgetEstimate"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </UFormField>
            </div>
          </div>

          <!-- Description -->
          <div>
            <UFormField label="Description / Scope" name="description" required>
              <UTextarea
                v-model="formState.description"
                :rows="5"
                placeholder="Enter detailed description and scope of work"
              />
            </UFormField>
          </div>

          <!-- Schedule -->
          <div>
            <h3 class="text-lg font-medium mb-4">Schedule</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Publish Date" name="publishDate">
                <UInput v-model="formState.publishDate" type="datetime-local" />
              </UFormField>

              <UFormField label="Submission Deadline" name="submissionDeadline" required>
                <UInput v-model="formState.submissionDeadline" type="datetime-local" />
              </UFormField>

              <UFormField label="Pre-Bid Meeting Date" name="preBidMeetingDate">
                <UInput v-model="formState.preBidMeetingDate" type="datetime-local" />
              </UFormField>

              <UFormField label="Pre-Bid Meeting Location" name="preBidMeetingLocation">
                <UInput
                  v-model="formState.preBidMeetingLocation"
                  placeholder="Enter meeting location"
                />
              </UFormField>
            </div>

            <UFormField label="Pre-Bid Meeting Notes" name="preBidNotes" class="mt-4">
              <UTextarea
                v-model="formState.preBidNotes"
                :rows="3"
                placeholder="Enter pre-bid meeting notes"
              />
            </UFormField>
          </div>

          <!-- Eligibility -->
          <div>
            <h3 class="text-lg font-medium mb-4">Eligibility & Contact</h3>
            <div class="space-y-4">
              <UFormField label="Eligibility Criteria" name="eligibilityCriteria">
                <UTextarea
                  v-model="formState.eligibilityCriteria"
                  :rows="3"
                  placeholder="Enter eligibility criteria for bidders"
                />
              </UFormField>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Contact Email" name="contactEmail">
                  <UInput
                    v-model="formState.contactEmail"
                    type="email"
                    placeholder="contact@example.com"
                  />
                </UFormField>

                <UFormField label="Contact Phone" name="contactPhone">
                  <UInput
                    v-model="formState.contactPhone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                  />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <UFormField label="Tags (comma-separated)" name="tags">
              <UInput v-model="tagsInput" placeholder="construction, renovation, urgent" />
            </UFormField>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t">
            <UButton color="gray" variant="ghost" @click="navigateTo('/admin/procurements')">
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="procurementStore.loading"
              @click="formState.status = 'draft'"
            >
              Save as Draft
            </UButton>
            <UButton
              type="submit"
              color="green"
              :loading="procurementStore.loading"
              @click="formState.status = 'published'"
            >
              Publish
            </UButton>
          </div>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { CreateProcurementInput, ProcurementStatus } from '~/interfaces/procurement/procurement.interface';
import { useProcurementStore } from '~/stores/procurement/procurement.store';
import { useAuthStore } from '~/stores/auth.store';

const procurementStore = useProcurementStore();
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const formState = reactive<CreateProcurementInput & { status?: string }>({
  title: '',
  referenceNo: '',
  category: '',
  type: '',
  location: '',
  description: '',
  eligibilityCriteria: '',
  submissionDeadline: '',
  publishDate: '',
  budgetEstimate: undefined,
  preBidMeetingDate: '',
  preBidMeetingLocation: '',
  preBidNotes: '',
  tags: [],
  contactEmail: '',
  contactPhone: '',
  createdBy: authStore.user?.id || 1, // Use authenticated user ID or fallback to 1
  status: 'draft',
});

const tagsInput = ref('');

const categoryOptions = [
  { label: 'Construction', value: 'Construction' },
  { label: 'IT Services', value: 'IT Services' },
  { label: 'Consulting', value: 'Consulting' },
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Other', value: 'Other' },
];

const typeOptions = [
  { label: 'Open Tender', value: 'Open Tender' },
  { label: 'Restricted Tender', value: 'Restricted Tender' },
  { label: 'Request for Proposal (RFP)', value: 'Request for Proposal (RFP)' },
  { label: 'Request for Quotation (RFQ)', value: 'Request for Quotation (RFQ)' },
];

const locationOptions = [
  { label: 'Lagos', value: 'Lagos' },
  { label: 'Abuja', value: 'Abuja' },
  { label: 'Port Harcourt', value: 'Port Harcourt' },
  { label: 'Kano', value: 'Kano' },
  { label: 'Ibadan', value: 'Ibadan' },
  { label: 'Other', value: 'Other' },
];

const handleSubmit = async () => {
  try {
    // Parse tags from input
    if (tagsInput.value) {
      formState.tags = tagsInput.value.split(',').map((tag) => tag.trim()).filter(Boolean);
    }

    const procurement = await procurementStore.createProcurement(formState);
    
    toast.add({
      title: 'Success',
      description: `Procurement ${formState.status === 'published' ? 'published' : 'saved as draft'} successfully`,
      color: 'green',
    });

    router.push(`/admin/procurements/${procurement.id}`);
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to create procurement',
      color: 'red',
    });
  }
};
</script>
