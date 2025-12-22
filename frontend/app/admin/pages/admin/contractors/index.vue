<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Procurement</p>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Contractor Registry</h1>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <UIcon name="i-lucide-users" class="w-4 h-4" />
          <span>{{ contractorStore.totalContractors }} contractors</span>
          <UBadge color="green" variant="subtle">{{ activeCount }} active</UBadge>
        </div>
        <UButton color="primary" icon="i-lucide-plus" @click="openCreate">New Contractor</UButton>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center gap-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search company or contractor number"
            class="w-full md:w-72"
          />
          <USelectMenu
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="All status"
            class="w-full md:w-48"
            value-key="value"
          />
          <USelectMenu
            v-model="selectedMajorArea"
            :items="majorAreaOptions"
            placeholder="All major areas"
            class="w-full md:w-52"
            value-key="value"
          />
          <USelectMenu
            v-model="selectedState"
            :items="stateOptions"
            placeholder="All states"
            class="w-full md:w-48"
            value-key="value"
          />
          <UButton variant="ghost" color="gray" size="sm" @click="resetFilters">Reset</UButton>
        </div>
      </template>

      <UTable :data="filteredContractors" :columns="columns" :loading="contractorStore.loading">
        <template #contractorNo-cell="{ row }">
          <NuxtLink
            :to="`/admin/contractors/${row.original.contractorNo}`"
            class="font-mono text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            {{ row.original.contractorNo }}
          </NuxtLink>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #phone-cell="{ row }">
          <span>{{ row.original.phone || '—' }}</span>
        </template>

        <template #updatedAt-cell="{ row }">
          {{ formatDate(row.original.updatedAt) }}
        </template>

        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-pencil"
            color="gray"
            variant="ghost"
            size="xs"
            @click="openEdit(row.original)"
          />
          <UButton
            icon="i-lucide-eye"
            color="gray"
            variant="ghost"
            size="xs"
            :to="`/admin/contractors/${row.original.contractorNo}`"
          />
        </template>
      </UTable>

      <template v-if="!contractorStore.loading && filteredContractors.length === 0" #footer>
        <div class="text-center text-sm text-gray-500 py-4">
          No contractors match the selected filters.
        </div>
      </template>
    </UCard>
  </div>

  <ContractorModal
    :open="showModal"
    :contractor="editingContractor"
    @update:open="showModal = $event"
    @saved="handleSaved"
  />
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Contractor } from '~/interfaces/procurement/contractor.interface';
import { useContractorStore } from '~/stores/procurement/contractor.store';
import ContractorModal from '~/admin/components/contractors/ContractorModal.vue';

const contractorStore = useContractorStore();
const toast = useToast();

const search = ref('');
const selectedStatus = ref<string | undefined>(undefined);
const selectedMajorArea = ref<string | undefined>(undefined);
const selectedState = ref<string | undefined>(undefined);
const editingContractor = ref<Contractor | null>(null);
const showModal = ref(false);

const columns: TableColumn<Contractor>[] = [
  { accessorKey: 'contractorNo', header: 'Contractor No' },
  { accessorKey: 'companyName', header: 'Company' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'registrationCategory', header: 'Category' },
  { accessorKey: 'majorArea', header: 'Major Area' },
  { accessorKey: 'stateOfOrigin', header: 'State' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'updatedAt', header: 'Updated' },
  { accessorKey: 'actions', header: 'Actions' },
];

const statusOptions = computed(() => {
  const statuses = new Set<string>();
  contractorStore.contractors.forEach((c) => {
    if (c.status) statuses.add(c.status);
  });
  return [
    { label: 'All status', value: undefined },
    ...Array.from(statuses).map((s) => ({ label: s, value: s })),
  ];
});

const majorAreaOptions = computed(() => {
  const areas = new Set<string>();
  contractorStore.contractors.forEach((c) => {
    if (c.majorArea) areas.add(c.majorArea);
  });
  return [
    { label: 'All major areas', value: undefined },
    ...Array.from(areas).map((a) => ({ label: a, value: a })),
  ];
});

const stateOptions = computed(() => {
  const states = new Set<string>();
  contractorStore.contractors.forEach((c) => {
    if (c.stateOfOrigin) states.add(c.stateOfOrigin);
  });
  return [
    { label: 'All states', value: undefined },
    ...Array.from(states).map((s) => ({ label: s, value: s })),
  ];
});

const filteredContractors = computed(() => {
  let results = [...contractorStore.contractors];

  if (search.value) {
    const term = search.value.toLowerCase();
    results = results.filter(
      (c) =>
        c.companyName.toLowerCase().includes(term) ||
        c.contractorNo.toLowerCase().includes(term) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(term)),
    );
  }

  if (selectedStatus.value) {
    results = results.filter((c) => c.status === selectedStatus.value);
  }

  if (selectedMajorArea.value) {
    results = results.filter((c) => c.majorArea === selectedMajorArea.value);
  }

  if (selectedState.value) {
    results = results.filter((c) => c.stateOfOrigin === selectedState.value);
  }

  return results;
});

const activeCount = computed(() => contractorStore.activeContractors.length);

const statusColor = (status: string): 'green' | 'gray' | 'red' | 'orange' => {
  const normalized = status.toLowerCase();
  if (normalized.includes('active')) return 'green';
  if (normalized.includes('inactive')) return 'gray';
  if (normalized.includes('suspend') || normalized.includes('blocked')) return 'red';
  return 'orange';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const resetFilters = () => {
  search.value = '';
  selectedStatus.value = undefined;
  selectedMajorArea.value = undefined;
  selectedState.value = undefined;
};

const openCreate = () => {
  editingContractor.value = null;
  showModal.value = true;
};

const openEdit = (contractor: Contractor) => {
  editingContractor.value = contractor;
  showModal.value = true;
};

const handleSaved = () => {
  editingContractor.value = null;
  showModal.value = false;
};

const fetchData = async () => {
  try {
    await contractorStore.fetchContractors();
  } catch (error) {
    console.error(error);
    toast.add({ title: 'Error', description: 'Failed to load contractors', color: 'red' });
  }
};

onMounted(() => {
  fetchData();
});
</script>
