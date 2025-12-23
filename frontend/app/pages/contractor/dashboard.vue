<script setup lang="ts">
import { useBidStore } from '~/stores/procurement/bid.store';
import { useAuthStore } from '~/stores/auth.store';
import type { TableColumn } from '@nuxt/ui';
import type { Bid } from '~/interfaces/procurement/bid.interface';

definePageMeta({
  middleware: ['auth'],
});

const bidStore = useBidStore();
const authStore = useAuthStore();

const columns: TableColumn<Bid>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'procurementId', header: 'Procurement' }, // We'll slot this to show title
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'submittedAt', header: 'Date' },
  { id: 'actions', header: 'Actions' },
];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

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

onMounted(async () => {
  await bidStore.fetchMyBids();
});
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Contractor Dashboard</h1>
        <p class="text-gray-500 mt-1">Welcome back, {{ authStore.user?.firstName }}</p>
      </div>
      <UButton to="/procurement" icon="i-heroicons-magnifying-glass" color="primary"
        >Find More Tenders</UButton
      >
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Your Bidding History</h2>
          <UButton
            :loading="bidStore.loading"
            icon="i-heroicons-arrow-path"
            color="neutral"
            variant="ghost"
            @click="bidStore.fetchMyBids()"
          />
        </div>
      </template>

      <UTable :data="bidStore.bids" :columns="columns" :loading="bidStore.loading">
        <template #procurementId-cell="{ row }">
          {{ row.original.procurement?.title || 'N/A' }}
        </template>

        <template #amount-cell="{ row }">
          {{ row.original.amount ? '₦' + row.original.amount.toLocaleString() : 'N/A' }}
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #submittedAt-cell="{ row }">
          {{ formatDate(row.original.submittedAt) }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              v-if="row.original.proposalUrl"
              :to="row.original.proposalUrl"
              target="_blank"
              icon="i-heroicons-document-text"
              color="neutral"
              variant="ghost"
            />
            <UButton
              :to="`/procurement/${row.original.procurementId}`"
              icon="i-heroicons-eye"
              color="neutral"
              variant="ghost"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </UContainer>
</template>
