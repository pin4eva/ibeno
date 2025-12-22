<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="procurementStore.loading && !procurement" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      <p class="mt-2 text-gray-600">Loading procurement details...</p>
    </div>

    <!-- Content -->
    <div v-else-if="procurement" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <UButton
            icon="i-lucide-arrow-left"
            color="gray"
            variant="ghost"
            to="/admin/procurements"
          />
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ procurement.title }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ procurement.referenceNo }}</p>
          </div>
        </div>
        <UBadge :color="getStatusColor(procurement.status)" variant="subtle" size="lg">
          {{ procurement.status }}
        </UBadge>
      </div>

      <!-- Actions & Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bids</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ procurement.bids?.length || 0 }}
              </p>
            </div>
            <UIcon name="i-lucide-users" class="w-8 h-8 text-primary-500 opacity-80" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Documents</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ procurement.documents?.length || 0 }}
              </p>
            </div>
            <UIcon name="i-lucide-file-text" class="w-8 h-8 text-blue-500 opacity-80" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Days Left</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ getRemainingDays(procurement.submissionDeadline) }}
              </p>
            </div>
            <UIcon name="i-lucide-calendar" class="w-8 h-8 text-orange-500 opacity-80" />
          </div>
        </UCard>

        <UCard>
          <div class="flex flex-col gap-2">
            <UButton
              icon="i-lucide-edit"
              color="primary"
              variant="solid"
              size="sm"
              block
              @click="isEditing = true"
            >
              Edit
            </UButton>
            <UButton
              v-if="procurement.status === 'published'"
              icon="i-lucide-lock"
              color="orange"
              variant="solid"
              size="sm"
              block
              @click="closeProcurement"
            >
              Close
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Details Tabs -->
      <UTabs :items="tabs" v-model:selected="selectedTab">
        <!-- Overview Tab -->
        <template #overview>
          <div class="space-y-4 py-4">
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Basic Information</h3>
              </template>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Category</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ procurement.category }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Type</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ procurement.type }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Location</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ procurement.location }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Budget Estimate</p>
                  <p class="mt-1 text-gray-900 dark:text-white">
                    {{ procurement.budgetEstimate ? `₦${procurement.budgetEstimate.toLocaleString()}` : 'N/A' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Publish Date</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ formatDate(procurement.publishDate) }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Submission Deadline</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ formatDate(procurement.submissionDeadline) }}</p>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Description</h3>
              </template>
              <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ procurement.description }}</p>
            </UCard>

            <UCard v-if="procurement.eligibilityCriteria">
              <template #header>
                <h3 class="text-lg font-semibold">Eligibility Criteria</h3>
              </template>
              <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ procurement.eligibilityCriteria }}</p>
            </UCard>
          </div>
        </template>

        <!-- Bids Tab -->
        <template #bids>
          <div class="py-4">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">Bids ({{ procurement.bids?.length || 0 }})</h3>
                  <UButton
                    icon="i-lucide-download"
                    color="primary"
                    variant="ghost"
                    size="sm"
                    @click="exportBids"
                  >
                    Export
                  </UButton>
                </div>
              </template>

              <UTable
                v-if="procurement.bids && procurement.bids.length > 0"
                :data="procurement.bids"
                :columns="bidColumns"
              >
                <template #contractorNo-cell="{ row }">
                  <span class="font-mono text-sm">{{ row.original.contractorNo }}</span>
                </template>

                <template #status-cell="{ row }">
                  <UBadge :color="getBidStatusColor(row.original.status)" variant="subtle">
                    {{ row.original.status }}
                  </UBadge>
                </template>

                <template #price-cell="{ row }">
                  {{ row.original.price ? `₦${row.original.price.toLocaleString()}` : 'N/A' }}
                </template>

                <template #submittedAt-cell="{ row }">
                  {{ formatDate(row.original.submittedAt) }}
                </template>

                <template #actions-cell="{ row }">
                  <UButton
                    icon="i-lucide-eye"
                    color="primary"
                    variant="ghost"
                    size="xs"
                    @click="viewBid(row.original)"
                  />
                </template>
              </UTable>

              <div v-else class="text-center py-8 text-gray-500">
                No bids submitted yet
              </div>
            </UCard>
          </div>
        </template>

        <!-- Documents Tab -->
        <template #documents>
          <div class="py-4 space-y-4">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">Documents</h3>
                  <UButton
                    icon="i-lucide-upload"
                    color="primary"
                    variant="solid"
                    size="sm"
                    @click="showUploadModal = true"
                  >
                    Upload Document
                  </UButton>
                </div>
              </template>

              <div v-if="procurement.documents && procurement.documents.length > 0" class="space-y-2">
                <div
                  v-for="doc in procurement.documents"
                  :key="doc.id"
                  class="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div class="flex items-center gap-3">
                    <UIcon name="i-lucide-file" class="w-5 h-5 text-gray-500" />
                    <div>
                      <p class="font-medium">{{ doc.name }}</p>
                      <p class="text-sm text-gray-500">{{ formatFileSize(doc.size) }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <UButton
                      icon="i-lucide-download"
                      color="gray"
                      variant="ghost"
                      size="xs"
                      :href="doc.url"
                      target="_blank"
                    />
                    <UButton
                      icon="i-lucide-trash"
                      color="red"
                      variant="ghost"
                      size="xs"
                      @click="deleteDocument(doc.id)"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                No documents uploaded yet
              </div>
            </UCard>
          </div>
        </template>
      </UTabs>
    </div>

    <!-- Edit Modal -->
    <UModal v-model:open="isEditing" :ui="{ width: 'max-w-3xl' }">
      <template #header>
        <h3 class="text-lg font-semibold">Edit Procurement</h3>
      </template>

      <template #body>
        <div class="space-y-4">
          <UFormField label="Title" required>
            <UInput v-model="editForm.title" />
          </UFormField>
          <UFormField label="Description" required>
            <UTextarea v-model="editForm.description" :rows="5" />
          </UFormField>
          <!-- Add more fields as needed -->
        </div>
      </template>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton color="gray" variant="ghost" @click="isEditing = false">
            Cancel
          </UButton>
          <UButton
            color="primary"
            :loading="procurementStore.loading"
            @click="handleUpdate"
          >
            Save Changes
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Upload Document Modal -->
    <UModal v-model:open="showUploadModal">
      <template #header>
        <h3 class="text-lg font-semibold">Upload Document</h3>
      </template>

      <template #body>
        <div class="space-y-4">
          <UFormField label="Document Name" required>
            <UInput v-model="uploadForm.name" placeholder="Enter document name" />
          </UFormField>
          <UFormField label="Document URL" required>
            <UInput v-model="uploadForm.url" placeholder="https://..." />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton color="gray" variant="ghost" @click="showUploadModal = false">
            Cancel
          </UButton>
          <UButton
            color="primary"
            :loading="procurementStore.loading"
            @click="handleUploadDocument"
          >
            Upload
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { useProcurementStore } from '~/stores/procurement/procurement.store';
import type { Bid } from '~/interfaces/procurement/bid.interface';
import type { UploadDocumentInput } from '~/interfaces/procurement/procurement.interface';

const route = useRoute();
const procurementStore = useProcurementStore();
const toast = useToast();

const procurementId = computed(() => parseInt(route.params.id as string));
const procurement = computed(() => procurementStore.currentProcurement);
const selectedTab = ref(0);
const isEditing = ref(false);
const showUploadModal = ref(false);

const tabs = [
  { label: 'Overview', value: 'overview', icon: 'i-lucide-info' },
  { label: 'Bids', value: 'bids', icon: 'i-lucide-users' },
  { label: 'Documents', value: 'documents', icon: 'i-lucide-file-text' },
];

const bidColumns: TableColumn<Bid>[] = [
  { accessorKey: 'contractorNo', header: 'Contractor #' },
  { accessorKey: 'contactName', header: 'Contact' },
  { accessorKey: 'contactEmail', header: 'Email' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'submittedAt', header: 'Submitted' },
  { accessorKey: 'actions', header: 'Actions' },
];

const editForm = reactive({
  title: '',
  description: '',
});

const uploadForm = reactive<UploadDocumentInput>({
  name: '',
  url: '',
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getRemainingDays = (deadlineString: string) => {
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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

const getBidStatusColor = (status: string) => {
  const colors: Record<string, 'gray' | 'green' | 'orange' | 'blue' | 'red' | 'yellow'> = {
    submitted: 'blue',
    under_review: 'yellow',
    accepted: 'green',
    rejected: 'red',
    withdrawn: 'gray',
    awarded: 'green',
  };
  return colors[status] || 'gray';
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const closeProcurement = async () => {
  try {
    await procurementStore.updateProcurement({
      id: procurementId.value,
      status: 'closed' as never,
    });
    toast.add({
      title: 'Success',
      description: 'Procurement closed successfully',
      color: 'green',
    });
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to close procurement',
      color: 'red',
    });
  }
};

const handleUpdate = async () => {
  try {
    await procurementStore.updateProcurement({
      id: procurementId.value,
      ...editForm,
    });
    toast.add({
      title: 'Success',
      description: 'Procurement updated successfully',
      color: 'green',
    });
    isEditing.value = false;
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to update procurement',
      color: 'red',
    });
  }
};

const handleUploadDocument = async () => {
  try {
    await procurementStore.uploadDocument(procurementId.value, uploadForm);
    toast.add({
      title: 'Success',
      description: 'Document uploaded successfully',
      color: 'green',
    });
    showUploadModal.value = false;
    uploadForm.name = '';
    uploadForm.url = '';
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to upload document',
      color: 'red',
    });
  }
};

const deleteDocument = async (documentId: number) => {
  try {
    await procurementStore.deleteDocument(documentId);
    toast.add({
      title: 'Success',
      description: 'Document deleted successfully',
      color: 'green',
    });
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to delete document',
      color: 'red',
    });
  }
};

const viewBid = (bid: Bid) => {
  // Navigate to bid detail or show modal
  console.log('View bid:', bid);
};

const exportBids = () => {
  // Export bids to CSV
  console.log('Export bids');
};

onMounted(async () => {
  try {
    await procurementStore.fetchProcurementById(procurementId.value);
    if (procurement.value) {
      editForm.title = procurement.value.title;
      editForm.description = procurement.value.description;
    }
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
