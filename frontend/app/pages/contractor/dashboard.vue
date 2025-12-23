<template>
  <UContainer>
    <div class="container mx-auto py-8 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Contractor Dashboard</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage your bids and track submissions
          </p>
        </div>
        <UButton icon="i-lucide-briefcase" color="primary" to="/procurement">
          View Procurements
        </UButton>
      </div>

      <!-- Contractor Number Input -->
      <UCard v-if="!contractorNo">
        <template #header>
          <h3 class="text-lg font-semibold">Enter Your Contractor Number</h3>
        </template>
        <div class="space-y-4">
          <UFormField label="Contractor Number" name="contractorNo" required>
            <UInput
              v-model="contractorNoInput"
              placeholder="Enter your contractor number (e.g., CTR-00001)"
            />
          </UFormField>
          <UButton
            icon="i-lucide-log-in"
            color="primary"
            :loading="contractorStore.loading"
            @click="loadBids"
          >
            Load My Bids
          </UButton>
        </div>
      </UCard>

      <!-- Loading State -->
      <div v-else-if="contractorStore.loading" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="mt-2 text-gray-600">Loading your bids...</p>
      </div>

      <!-- Bids Table -->
      <div v-else-if="bids && bids.length > 0" class="space-y-4">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bids</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ bids.length }}
                </p>
              </div>
              <UIcon name="i-lucide-file-text" class="w-8 h-8 text-primary-500 opacity-80" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ submittedBids }}
                </p>
              </div>
              <UIcon name="i-lucide-send" class="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Under Review</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ underReviewBids }}
                </p>
              </div>
              <UIcon name="i-lucide-eye" class="w-8 h-8 text-orange-500 opacity-80" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Awarded</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ awardedBids }}
                </p>
              </div>
              <UIcon name="i-lucide-award" class="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </UCard>
        </div>

        <!-- Bids Table -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">My Bids</h3>
              <UButton
                icon="i-lucide-refresh-cw"
                color="gray"
                variant="ghost"
                size="sm"
                @click="loadBids"
              >
                Refresh
              </UButton>
            </div>
          </template>

          <UTable :data="bids" :columns="columns">
            <template #referenceNo-cell="{ row }">
              <span class="font-mono text-sm">{{ row.original.procurement?.referenceNo }}</span>
            </template>

            <template #title-cell="{ row }">
              <div>
                <p class="font-medium">{{ row.original.procurement?.title }}</p>
                <p class="text-sm text-gray-500">{{ 'category' }}</p>
              </div>
            </template>

            <template #status-cell="{ row }">
              <UBadge :color="getStatusColor(row.original.status)" variant="subtle">
                {{ row.original.status.replace('_', ' ') }}
              </UBadge>
            </template>

            <template #price-cell="{ row }">
              {{ row.original.price ? `₦${row.original.price.toLocaleString()}` : 'N/A' }}
            </template>

            <template #submittedAt-cell="{ row }">
              {{ formatDate(row.original.submittedAt) }}
            </template>

            <template #actions-cell="{ row }">
              <div class="flex gap-2">
                <UButton
                  icon="i-lucide-eye"
                  color="primary"
                  variant="ghost"
                  size="xs"
                  @click="viewBidDetails(row.original)"
                />
              </div>
            </template>
          </UTable>
        </UCard>
      </div>

      <!-- No Bids State -->
      <UCard v-else>
        <div class="text-center py-12">
          <UIcon name="i-lucide-inbox" class="w-16 h-16 mx-auto text-gray-400" />
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No bids yet</h3>
          <p class="mt-2 text-gray-500">
            You haven't submitted any bids. Browse procurements to get started.
          </p>
          <UButton class="mt-4" icon="i-lucide-briefcase" color="primary" to="/procurement">
            View Procurements
          </UButton>
        </div>
      </UCard>

      <!-- Bid Details Modal -->
      <UModal v-model:open="showBidDetails">
        <template #header>
          <h3 class="text-lg font-semibold">Bid Details</h3>
        </template>

        <template #body>
          <div v-if="selectedBid" class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Procurement</p>
              <p class="mt-1 text-gray-900 dark:text-white">{{ selectedBid.procurement?.title }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Reference No</p>
              <p class="mt-1 text-gray-900 dark:text-white font-mono">
                {{ selectedBid.procurement?.referenceNo }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Status</p>
              <UBadge :color="getStatusColor(selectedBid.status)" variant="subtle" class="mt-1">
                {{ selectedBid.status.replace('_', ' ') }}
              </UBadge>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Bid Price</p>
              <p class="mt-1 text-gray-900 dark:text-white">
                {{ selectedBid.price ? `₦${selectedBid.price.toLocaleString()}` : 'N/A' }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Contact Information</p>
              <div class="mt-1 space-y-1">
                <p class="text-gray-900 dark:text-white">{{ selectedBid.contactName }}</p>
                <p class="text-gray-600 dark:text-gray-400">{{ selectedBid.contactEmail }}</p>
                <p class="text-gray-600 dark:text-gray-400">{{ selectedBid.contactPhone }}</p>
              </div>
            </div>

            <div v-if="selectedBid.technicalProposalUrl">
              <p class="text-sm font-medium text-gray-500">Technical Proposal</p>
              <UButton
                icon="i-lucide-download"
                color="primary"
                variant="outline"
                size="sm"
                class="mt-1"
                :href="selectedBid.technicalProposalUrl"
                target="_blank"
              >
                Download
              </UButton>
            </div>

            <div v-if="selectedBid.commercialProposalUrl">
              <p class="text-sm font-medium text-gray-500">Commercial Proposal</p>
              <UButton
                icon="i-lucide-download"
                color="primary"
                variant="outline"
                size="sm"
                class="mt-1"
                :href="selectedBid.commercialProposalUrl"
                target="_blank"
              >
                Download
              </UButton>
            </div>

            <div v-if="selectedBid.notes">
              <p class="text-sm font-medium text-gray-500">Notes</p>
              <p class="mt-1 text-gray-900 dark:text-white">{{ selectedBid.notes }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Submitted At</p>
              <p class="mt-1 text-gray-900 dark:text-white">
                {{ formatDate(selectedBid.submittedAt) }}
              </p>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex gap-2 justify-end">
            <UButton color="gray" variant="ghost" @click="showBidDetails = false">Close</UButton>
          </div>
        </template>
      </UModal>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Bid } from '~/interfaces/procurement/bid.interface';
import { useContractorStore } from '~/stores/procurement/contractor.store';

const contractorStore = useContractorStore();
const toast = useToast();

const contractorNo = ref('');
const contractorNoInput = ref('');
const bids = ref<Bid[]>([]);
const showBidDetails = ref(false);
const selectedBid = ref<Bid | null>(null);

const columns: TableColumn<Bid>[] = [
  { accessorKey: 'procurement.referenceNo', header: 'Reference No' },
  { accessorKey: 'procurement.title', header: 'Procurement' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'price', header: 'Bid Amount' },
  { accessorKey: 'submittedAt', header: 'Submitted' },
  { accessorKey: 'actions', header: '' },
];

const submittedBids = computed(() => {
  return bids.value.filter((b) => b.status === 'submitted').length;
});

const underReviewBids = computed(() => {
  return bids.value.filter((b) => b.status === 'under_review').length;
});

const awardedBids = computed(() => {
  return bids.value.filter((b) => b.status === 'awarded').length;
});

const loadBids = async () => {
  if (!contractorNoInput.value) {
    toast.add({
      title: 'Error',
      description: 'Please enter your contractor number',
      color: 'red',
    });
    return;
  }

  try {
    contractorNo.value = contractorNoInput.value;
    bids.value = await contractorStore.fetchMyBids(contractorNo.value);
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to load bids. Please check your contractor number.',
      color: 'red',
    });
    contractorNo.value = '';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'red'> = {
    submitted: 'blue',
    under_review: 'orange',
    accepted: 'green',
    rejected: 'red',
    withdrawn: 'gray',
    awarded: 'green',
  };
  return colors[status] || 'gray';
};

const viewBidDetails = (bid: any) => {
  selectedBid.value = bid;
  showBidDetails.value = true;
};
</script>
