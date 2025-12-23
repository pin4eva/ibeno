<script setup lang="ts">
import { useProcurementStore } from '~/stores/procurement/procurement.store';
import { useBidStore } from '~/stores/procurement/bid.store';
import type { Bid } from '~/interfaces/procurement/bid.interface';
import { BidStatus } from '~/interfaces/procurement/bid.interface';
import type { TableColumn } from '@nuxt/ui';

const route = useRoute();
const procurementStore = useProcurementStore();
const bidStore = useBidStore();
const toast = useToast();

const procurementId = computed(() => parseInt(route.params.id as string));
const procurement = computed(() => procurementStore.currentProcurement);

const columns: TableColumn<Bid>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'contractorNo', header: 'Contractor No' },
  { accessorKey: 'contactName', header: 'Name' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'submittedAt', header: 'Date' },
  { id: 'actions', header: 'Actions' },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, 'neutral' | 'success' | 'warning' | 'primary' | 'error'> = {
    submitted: 'neutral',
    under_review: 'warning',
    accepted: 'success',
    rejected: 'error',
    withdrawn: 'neutral',
    awarded: 'primary',
  };
  return colors[status] || 'neutral';
};

const handleStatusChange = async (bidId: number, status: BidStatus) => {
  try {
    await bidStore.changeBidStatus(procurementId.value, bidId, { status });
    toast.add({ title: 'Success', description: 'Bid status updated', color: 'success' });
    await bidStore.fetchBidsByProcurement(procurementId.value);
  } catch (error: unknown) {
    const err = error as Error;
    toast.add({ title: 'Error', description: err.message || 'Update failed', color: 'error' });
  }
};

onMounted(async () => {
  await procurementStore.fetchProcurementById(procurementId.value);
  await bidStore.fetchBidsByProcurement(procurementId.value);
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-heroicons-arrow-left"
          color="neutral"
          variant="ghost"
          :to="`/admin/procurements/${procurementId}`"
        />
        <div>
          <h1 class="text-2xl font-bold">Bid Evaluation</h1>
          <p class="text-gray-500">{{ procurement?.title }} ({{ procurement?.referenceNo }})</p>
        </div>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Submissions</h2>
          <div class="flex gap-2">
            <UButton icon="i-heroicons-arrow-down-tray" color="neutral" variant="outline">
              Export CSV
            </UButton>
          </div>
        </div>
      </template>

      <UTable :data="bidStore.bids" :columns="columns" :loading="bidStore.loading">
        <template #amount-cell="{ row }">
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ row.original.amount ? '₦' + row.original.amount.toLocaleString() : 'N/A' }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #submittedAt-cell="{ row }">
          {{ new Date(row.original.submittedAt).toLocaleDateString() }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              v-if="row.original.proposalUrl"
              :to="row.original.proposalUrl"
              target="_blank"
              color="primary"
              variant="soft"
              size="sm"
            >
              Review Proposal
            </UButton>

            <UDropdownMenu
              :items="[
                [
                  {
                    label: 'Under Review',
                    onSelect: () => handleStatusChange(row.original.id, BidStatus.UNDER_REVIEW),
                  },
                  {
                    label: 'Accept',
                    onSelect: () => handleStatusChange(row.original.id, BidStatus.ACCEPTED),
                  },
                  {
                    label: 'Reject',
                    onSelect: () => handleStatusChange(row.original.id, BidStatus.REJECTED),
                  },
                  {
                    label: 'Award Contract',
                    onSelect: () => handleStatusChange(row.original.id, BidStatus.AWARDED),
                    color: 'primary',
                  },
                ],
              ]"
            >
              <UButton color="neutral" variant="ghost" icon="i-heroicons-ellipsis-vertical" />
            </UDropdownMenu>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
