<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div class="space-y-2">
        <div class="text-sm text-gray-500 dark:text-gray-400">Contractor</div>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ contractor?.companyName || 'Contractor details' }}
          </h1>
          <UBadge v-if="contractor" :color="statusColor(contractor.status)" variant="subtle">
            {{ contractor.status }}
          </UBadge>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span class="font-mono text-xs">{{ contractor?.contractorNo || '—' }}</span>
          <span v-if="contractor?.registrationCategory"
            >• {{ contractor.registrationCategory }}</span
          >
          <span v-if="contractor?.majorArea">• {{ contractor.majorArea }}</span>
          <span v-if="contractor?.stateOfOrigin">• {{ contractor.stateOfOrigin }}</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton color="gray" variant="ghost" icon="i-lucide-arrow-left" to="/admin/contractors">
          Back to list
        </UButton>
        <UButton color="primary" icon="i-lucide-pencil" :disabled="!contractor" @click="openEdit">
          Edit
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      title="Failed to load contractor"
      :description="error"
    />

    <div v-if="loading" class="grid gap-4 md:grid-cols-3">
      <USkeleton class="h-32" />
      <USkeleton class="h-32" />
      <USkeleton class="h-32" />
    </div>

    <div v-else-if="contractor" class="space-y-6">
      <div class="grid gap-4 md:grid-cols-3">
        <UCard>
          <template #header>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Registration</div>
          </template>
          <div class="space-y-2">
            <div>
              <p class="text-xs uppercase text-gray-500">Contractor No</p>
              <p class="font-mono text-sm">{{ contractor.contractorNo }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">CAC No</p>
              <p class="text-sm">{{ contractor.cacRegNo || '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Old Reg No</p>
              <p class="text-sm">{{ contractor.oldRegNo || '—' }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Location</div>
          </template>
          <div class="space-y-2">
            <div>
              <p class="text-xs uppercase text-gray-500">State</p>
              <p class="text-sm">{{ contractor.stateOfOrigin || '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Community</p>
              <p class="text-sm">{{ contractor.community || '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Major Area</p>
              <p class="text-sm">{{ contractor.majorArea || '—' }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</div>
          </template>
          <div class="space-y-2">
            <div>
              <p class="text-xs uppercase text-gray-500">Contact Person</p>
              <p class="text-sm">{{ contractor.contactPerson || '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Phone</p>
              <p class="text-sm">{{ contractor.phone || '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Email</p>
              <p class="text-sm">{{ contractor.email || '—' }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Engagement</p>
              <h3 class="text-lg font-semibold">Bids</h3>
            </div>
            <UBadge variant="subtle" color="gray">{{ bids.length }} total</UBadge>
          </div>
        </template>

        <div v-if="bids.length === 0" class="py-6 text-center text-sm text-gray-500">
          No bids recorded for this contractor yet.
        </div>
        <UTable v-else :data="bids" :columns="bidColumns" />
      </UCard>

      <UCard>
        <template #header>
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</div>
        </template>
        <p class="text-sm text-gray-700 dark:text-gray-200" v-if="contractor.notes">
          {{ contractor.notes }}
        </p>
        <p v-else class="text-sm text-gray-500">No notes available.</p>
      </UCard>
    </div>
  </div>

  <ContractorModal
    :open="showModal"
    :contractor="contractor"
    @update:open="showModal = $event"
    @saved="handleSaved"
  />
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import ContractorModal from '~/admin/components/contractors/ContractorModal.vue';
import type { Contractor } from '~/interfaces/procurement/contractor.interface';
import { useContractorStore } from '~/stores/procurement/contractor.store';

const route = useRoute();
const contractorStore = useContractorStore();
const toast = useToast();

const showModal = ref(false);
const loading = computed(() => contractorStore.loading);
const error = computed(() => contractorStore.error);
const contractor = computed(() => contractorStore.currentContractor);
const contractorNo = computed(() => route.params.contractorNo as string);

const bidColumns: TableColumn<NonNullable<Contractor['bids']>[number]>[] = [
  { accessorKey: 'procurement.referenceNo', header: 'Reference' },
  {
    accessorKey: 'procurement.title',
    header: 'Procurement',
    cell: ({ row }) => row.original.procurement?.title || '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => row.original.status || '—',
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => (row.original.submittedAt ? formatDate(row.original.submittedAt) : '—'),
  },
];

const bids = computed(() => contractor.value?.bids || []);

const statusColor = (status?: string): 'success' | 'gray' | 'orange' | 'error' => {
  if (!status) return 'gray';
  const normalized = status.toLowerCase();
  if (normalized.includes('active')) return 'success';
  if (normalized.includes('inactive')) return 'gray';
  if (normalized.includes('suspend') || normalized.includes('blocked')) return 'error';
  return 'orange';
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const fetchContractor = async () => {
  try {
    await contractorStore.fetchContractorByNo(contractorNo.value);
  } catch (err) {
    console.error(err);
    toast.add({ title: 'Error', description: 'Could not load contractor', color: 'error' });
  }
};

const openEdit = () => {
  if (!contractor.value) return;
  showModal.value = true;
};

const handleSaved = async () => {
  showModal.value = false;
  await fetchContractor();
};

watch(
  () => contractorNo.value,
  () => {
    fetchContractor();
  },
  { immediate: true },
);
</script>
