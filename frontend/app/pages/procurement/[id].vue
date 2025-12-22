<template>
  <UContainer>
    <div class="container mx-auto py-8 space-y-6">
      <!-- Loading State -->
      <div v-if="procurementStore.loading && !procurement" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="mt-2 text-gray-600">Loading procurement details...</p>
      </div>

      <!-- Content -->
      <div v-else-if="procurement" class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" to="/procurement" />
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ procurement.title }}
                </h1>
                <p class="text-sm text-gray-500 mt-1">{{ procurement.referenceNo }}</p>
              </div>
            </div>
          </div>
          <UBadge :color="getStatusColor(procurement.status)" variant="subtle" size="lg">
            {{ procurement.status }}
          </UBadge>
        </div>

        <!-- Key Details -->
        <UCard>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
              <div class="flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-600" />
                <p class="text-base font-medium">{{ procurement.location }}</p>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
              <div class="flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-tag" class="w-4 h-4 text-gray-600" />
                <p class="text-base font-medium">{{ procurement.category }}</p>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
              <div class="flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-file-text" class="w-4 h-4 text-gray-600" />
                <p class="text-base font-medium">{{ procurement.type }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Deadline -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Submission Deadline
              </p>
              <p class="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                {{ formatDate(procurement.submissionDeadline) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Time Remaining</p>
              <p
                :class="[
                  'text-xl font-semibold mt-1',
                  getRemainingDays(procurement.submissionDeadline) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                ]"
              >
                {{
                  getRemainingDays(procurement.submissionDeadline) >= 0
                    ? `${getRemainingDays(procurement.submissionDeadline)} days left`
                    : 'Expired'
                }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Description -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Description & Scope</h3>
          </template>
          <div class="prose dark:prose-invert max-w-none" v-html="procurement.description" />
        </UCard>

        <!-- Eligibility Criteria -->
        <UCard v-if="procurement.eligibilityCriteria">
          <template #header>
            <h3 class="text-lg font-semibold">Eligibility Criteria</h3>
          </template>
          <div
            class="prose dark:prose-invert max-w-none"
            v-html="procurement.eligibilityCriteria"
          />
        </UCard>

        <!-- Pre-Bid Meeting -->
        <UCard v-if="procurement.preBidMeetingDate">
          <template #header>
            <h3 class="text-lg font-semibold">Pre-Bid Meeting</h3>
          </template>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-5 h-5 text-gray-500" />
              <span>{{ formatDate(procurement.preBidMeetingDate) }}</span>
            </div>
            <div v-if="procurement.preBidMeetingLocation" class="flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-gray-500" />
              <span>{{ procurement.preBidMeetingLocation }}</span>
            </div>
            <p v-if="procurement.preBidNotes" class="text-gray-600 dark:text-gray-400 mt-2">
              {{ procurement.preBidNotes }}
            </p>
          </div>
        </UCard>

        <!-- Documents -->
        <UCard v-if="procurement.documents && procurement.documents.length > 0">
          <template #header>
            <h3 class="text-lg font-semibold">Documents</h3>
          </template>
          <div class="space-y-2">
            <a
              v-for="doc in procurement.documents"
              :key="doc.id"
              :href="doc.url"
              target="_blank"
              class="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-file" class="w-5 h-5 text-gray-500" />
                <span class="font-medium">{{ doc.name }}</span>
              </div>
              <UIcon name="i-lucide-download" class="w-5 h-5 text-gray-500" />
            </a>
          </div>
        </UCard>

        <!-- Contact Information -->
        <UCard v-if="procurement.contactEmail || procurement.contactPhone">
          <template #header>
            <h3 class="text-lg font-semibold">Contact Information</h3>
          </template>
          <div class="space-y-3">
            <div v-if="procurement.contactEmail" class="flex items-center gap-2">
              <UIcon name="i-lucide-mail" class="w-5 h-5 text-gray-500" />
              <a
                :href="`mailto:${procurement.contactEmail}`"
                class="text-primary-600 hover:underline"
              >
                {{ procurement.contactEmail }}
              </a>
            </div>
            <div v-if="procurement.contactPhone" class="flex items-center gap-2">
              <UIcon name="i-lucide-phone" class="w-5 h-5 text-gray-500" />
              <a :href="`tel:${procurement.contactPhone}`" class="text-primary-600 hover:underline">
                {{ procurement.contactPhone }}
              </a>
            </div>
          </div>
        </UCard>

        <!-- Submit Bid Section -->
        <UCard v-if="getRemainingDays(procurement.submissionDeadline) >= 0">
          <template #header>
            <h3 class="text-lg font-semibold">Submit Your Bid</h3>
          </template>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              Only registered contractors with an active status can submit bids. Please ensure you
              have your contractor number ready.
            </p>
            <UButton color="primary" size="lg" icon="i-lucide-send" @click="showBidForm = true">
              Submit Bid
            </UButton>
          </div>
        </UCard>

        <!-- Bid Submission Modal -->
        <UModal v-model:open="showBidForm">
          <template #header>
            <h3 class="text-lg font-semibold">Submit Bid</h3>
          </template>

          <template #body>
            <UForm :state="bidFormState" @submit="handleBidSubmit">
              <div class="space-y-4">
                <UFormField label="Contractor Number" name="contractorNo" required>
                  <UInput
                    v-model="bidFormState.contractorNo"
                    placeholder="Enter your contractor number"
                  />
                </UFormField>

                <UFormField label="Contact Person Name" name="contactName" required>
                  <UInput v-model="bidFormState.contactName" placeholder="Enter contact name" />
                </UFormField>

                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Contact Email" name="contactEmail" required>
                    <UInput
                      v-model="bidFormState.contactEmail"
                      type="email"
                      placeholder="email@example.com"
                    />
                  </UFormField>

                  <UFormField label="Contact Phone" name="contactPhone" required>
                    <UInput
                      v-model="bidFormState.contactPhone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                    />
                  </UFormField>
                </div>

                <UFormField label="Bid Price (Optional)" name="price">
                  <UInput
                    v-model.number="bidFormState.price"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </UFormField>

                <UFormField label="Technical Proposal" name="technicalProposal">
                  <UInput
                    type="file"
                    accept=".pdf,.doc,.docx"
                    @change="handleTechnicalProposalChange"
                  />
                  <template #hint>
                    <span class="text-xs text-gray-500">Upload your technical proposal (PDF, DOC, DOCX)</span>
                  </template>
                </UFormField>

                <UFormField label="Commercial Proposal" name="commercialProposal">
                  <UInput
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    @change="handleCommercialProposalChange"
                  />
                  <template #hint>
                    <span class="text-xs text-gray-500">Upload your commercial proposal (PDF, DOC, DOCX, XLS, XLSX)</span>
                  </template>
                </UFormField>

                <UFormField label="Additional Notes" name="notes">
                  <UTextarea
                    v-model="bidFormState.notes"
                    :rows="3"
                    placeholder="Enter any additional notes"
                  />
                </UFormField>
              </div>
            </UForm>
          </template>

          <template #footer>
            <div class="flex gap-2 justify-end">
              <UButton color="gray" variant="ghost" @click="showBidForm = false"> Cancel </UButton>
              <UButton color="primary" :loading="bidStore.loading" @click="handleBidSubmit">
                Submit Bid
              </UButton>
            </div>
          </template>
        </UModal>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <UIcon name="i-lucide-alert-circle" class="w-16 h-16 mx-auto text-red-500" />
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Procurement not found
        </h3>
        <p class="mt-2 text-gray-500">The procurement you're looking for doesn't exist</p>
        <UButton class="mt-4" to="/procurement">Back to Procurements</UButton>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { useProcurementStore } from '~/stores/procurement/procurement.store';
import { useBidStore } from '~/stores/procurement/bid.store';
import type { CreateBidInput } from '~/interfaces/procurement/bid.interface';

const route = useRoute();
const procurementStore = useProcurementStore();
const bidStore = useBidStore();
const toast = useToast();

const procurementId = computed(() => parseInt(route.params.id as string));
const procurement = computed(() => procurementStore.currentProcurement);
const showBidForm = ref(false);

const technicalProposalFile = ref<File | null>(null);
const commercialProposalFile = ref<File | null>(null);

const bidFormState = reactive<CreateBidInput>({
  contractorNo: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  price: undefined,
  technicalProposalUrl: '',
  commercialProposalUrl: '',
  otherFiles: [],
  notes: '',
});

const handleTechnicalProposalChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    technicalProposalFile.value = target.files[0];
  }
};

const handleCommercialProposalChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    commercialProposalFile.value = target.files[0];
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getRemainingDays = (deadlineString: string) => {
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getStatusColor = (status: string) => {
  const colors: Record<string, 'gray' | 'green' | 'orange' | 'blue' | 'red'> = {
    draft: 'gray',
    published: 'green',
    closed: 'orange',
    awarded: 'blue',
    archived: 'red',
  };
  return colors[status] || 'gray';
};

const handleBidSubmit = async () => {
  try {
    // Upload files first if provided
    let technicalProposalUrl = bidFormState.technicalProposalUrl;
    let commercialProposalUrl = bidFormState.commercialProposalUrl;

    if (technicalProposalFile.value) {
      const formData = new FormData();
      formData.append('file', technicalProposalFile.value);
      const response = await $fetch<{ url: string }>('/api/upload', {
        method: 'POST',
        body: formData,
      });
      technicalProposalUrl = response.url;
    }

    if (commercialProposalFile.value) {
      const formData = new FormData();
      formData.append('file', commercialProposalFile.value);
      const response = await $fetch<{ url: string }>('/api/upload', {
        method: 'POST',
        body: formData,
      });
      commercialProposalUrl = response.url;
    }

    await bidStore.submitBid(procurementId.value, {
      ...bidFormState,
      technicalProposalUrl,
      commercialProposalUrl,
    });
    toast.add({
      title: 'Success',
      description: 'Your bid has been submitted successfully',
      color: 'green',
    });
    showBidForm.value = false;
    // Reset form
    Object.assign(bidFormState, {
      contractorNo: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      price: undefined,
      technicalProposalUrl: '',
      commercialProposalUrl: '',
      otherFiles: [],
      notes: '',
    });
    technicalProposalFile.value = null;
    commercialProposalFile.value = null;
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to submit bid. Please check your contractor number and try again.',
      color: 'red',
    });
  }
};

onMounted(async () => {
  try {
    await procurementStore.fetchProcurementById(procurementId.value);
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to load procurement details',
      color: 'red',
    });
  }
});
</script>
