<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Procurements</h2>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        variant="solid"
        label="Create Procurement"
        to="/admin/procurements/create"
      />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ procurementStore.totalProcurements }}
            </p>
          </div>
          <UIcon name="i-lucide-package" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ procurementStore.publishedProcurements.length }}
            </p>
          </div>
          <UIcon name="i-lucide-globe" class="w-8 h-8 text-green-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Drafts</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ procurementStore.draftProcurements.length }}
            </p>
          </div>
          <UIcon name="i-lucide-file-edit" class="w-8 h-8 text-yellow-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bids</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ totalBids }}
            </p>
          </div>
          <UIcon name="i-lucide-users" class="w-8 h-8 text-blue-500 opacity-80" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <template #header>
        <div class="flex flex-wrap gap-2">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search by title or reference..."
            class="w-64"
          />
          <USelectMenu
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="All Status"
            class="w-48"
            value-key="value"
          />
          <USelectMenu
            v-model="selectedLocation"
            :items="locationOptions"
            placeholder="All Locations"
            class="w-48"
            value-key="value"
          />
          <USelectMenu
            v-model="selectedCategory"
            :items="categoryOptions"
            placeholder="All Categories"
            class="w-48"
            value-key="value"
          />
        </div>
      </template>

      <UTable :data="filteredProcurements" :columns="columns" :loading="procurementStore.loading">
        <template #referenceNo-cell="{ row }">
          <span class="font-mono text-sm">{{ row.original.referenceNo }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #submissionDeadline-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm">{{ formatDate(row.original.submissionDeadline) }}</span>
            <span
              v-if="getRemainingDays(row.original.submissionDeadline) >= 0"
              class="text-xs text-gray-500"
            >
              {{ getRemainingDays(row.original.submissionDeadline) }} days left
            </span>
            <span v-else class="text-xs text-red-500">Expired</span>
          </div>
        </template>

        <template #bids-cell="{ row }">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-users" class="w-4 h-4 text-gray-500" />
            <span class="text-sm font-medium">{{ row.original._count?.bids || 0 }}</span>
          </div>
        </template>

        <template #updatedAt-cell="{ row }">
          {{ formatDate(row.original.updatedAt) }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-eye"
              color="primary"
              variant="ghost"
              size="xs"
              :to="`/admin/procurements/${row.original.id}`"
            />
            <UButton
              icon="i-lucide-trash"
              color="red"
              variant="ghost"
              size="xs"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #header>
        <h3 class="text-lg font-semibold">Confirm Delete</h3>
      </template>

      <template #body>
        <p>
          Are you sure you want to delete procurement <strong>{{ procurementToDelete?.title }}</strong>?
        </p>
        <p class="text-sm text-gray-500 mt-2">
          {{ procurementToDelete?.status === 'draft' ? 'This action cannot be undone.' : 'This will archive the procurement.' }}
        </p>
      </template>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton color="gray" variant="ghost" @click="showDeleteModal = false">
            Cancel
          </UButton>
          <UButton color="red" :loading="procurementStore.loading" @click="handleDelete">
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Procurement, ProcurementStatus } from '~/interfaces/procurement/procurement.interface';
import { useProcurementStore } from '~/stores/procurement/procurement.store';

const procurementStore = useProcurementStore();
const toast = useToast();

const search = ref('');
const selectedStatus = ref<ProcurementStatus | undefined>(undefined);
const selectedLocation = ref<string | undefined>(undefined);
const selectedCategory = ref<string | undefined>(undefined);
const showDeleteModal = ref(false);
const procurementToDelete = ref<Procurement | null>(null);

const columns: TableColumn<Procurement>[] = [
  { accessorKey: 'referenceNo', header: 'Reference' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'submissionDeadline', header: 'Deadline' },
  { accessorKey: 'bids', header: 'Bids' },
  { accessorKey: 'updatedAt', header: 'Updated' },
  { accessorKey: 'actions', header: 'Actions' },
];

const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Closed', value: 'closed' },
  { label: 'Awarded', value: 'awarded' },
  { label: 'Archived', value: 'archived' },
];

const locationOptions = computed(() => {
  const options: { label: string; value: string | undefined }[] = [
    { label: 'All Locations', value: undefined },
  ];
  procurementStore.locations.forEach((loc) => {
    options.push({ label: loc, value: loc });
  });
  return options;
});

const categoryOptions = computed(() => {
  const options: { label: string; value: string | undefined }[] = [
    { label: 'All Categories', value: undefined },
  ];
  procurementStore.categories.forEach((cat) => {
    options.push({ label: cat, value: cat });
  });
  return options;
});

const filteredProcurements = computed(() => {
  let filtered = [...procurementStore.procurements];

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.referenceNo.toLowerCase().includes(searchLower),
    );
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((p) => p.status === selectedStatus.value);
  }

  if (selectedLocation.value) {
    filtered = filtered.filter((p) => p.location === selectedLocation.value);
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((p) => p.category === selectedCategory.value);
  }

  return filtered;
});

const totalBids = computed(() => {
  return procurementStore.procurements.reduce((sum, p) => sum + (p._count?.bids || 0), 0);
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

const confirmDelete = (procurement: Procurement) => {
  procurementToDelete.value = procurement;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!procurementToDelete.value) return;

  try {
    await procurementStore.deleteProcurement(procurementToDelete.value.id);
    toast.add({
      title: 'Success',
      description: 'Procurement deleted successfully',
      color: 'green',
    });
    showDeleteModal.value = false;
    procurementToDelete.value = null;
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to delete procurement',
      color: 'red',
    });
  }
};

const fetchData = async () => {
  try {
    await procurementStore.fetchProcurements();
    await procurementStore.fetchCategories();
    await procurementStore.fetchLocations();
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to fetch procurements',
      color: 'red',
    });
  }
};

onMounted(() => {
  fetchData();
});
</script>
