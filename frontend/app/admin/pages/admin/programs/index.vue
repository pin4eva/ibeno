<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Programs</h2>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        variant="solid"
        label="Create Program"
        to="/admin/programs/create"
      />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Programs</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ programsStore.stats.total }}
            </p>
          </div>
          <UIcon name="i-lucide-folder" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Programs</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ programsStore.stats.active }}
            </p>
          </div>
          <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-green-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Programs</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ programsStore.stats.inactive }}
            </p>
          </div>
          <UIcon name="i-lucide-x-circle" class="w-8 h-8 text-gray-500 opacity-80" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <template #header>
        <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search programs..."
            class="w-full sm:w-64"
          />
          <USelectMenu
            v-model="selectedCategory"
            :options="categoryOptions"
            placeholder="All Categories"
            class="w-full sm:w-48"
          />
          <USelectMenu
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="All Status"
            class="w-full sm:w-48"
          />
        </div>
      </template>

      <UTable
        :data="filteredPrograms"
        :columns="columns"
        :loading="programsStore.loading"
        @select="onSelect"
      />
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Confirm Delete</h3>
        </template>
        <p class="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{{ programToDelete?.name }}"? This action cannot be
          undone.
        </p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showDeleteModal = false">
              Cancel
            </UButton>
            <UButton color="red" :loading="programsStore.loading" @click="confirmDelete">
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { useProgramsStore, type Program } from '~/stores/programs.store';
import { ProgramCategoryEnum } from '~/interfaces/programs.interface';

const programsStore = useProgramsStore();
const search = ref('');
const selectedCategory = ref<string | null>(null);
const selectedStatus = ref<boolean | null>(null);
const showDeleteModal = ref(false);
const programToDelete = ref<Program | null>(null);
const toast = useToast();

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const NuxtLink = resolveComponent('NuxtLink');
const UDropdown = resolveComponent('UDropdown');

const categoryOptions = [
  { label: 'All Categories', value: null },
  { label: 'Education', value: ProgramCategoryEnum.Education },
  { label: 'Medical Mission', value: ProgramCategoryEnum.Medical },
  { label: 'Community Service', value: ProgramCategoryEnum.Community },
];

const statusOptions = [
  { label: 'All Status', value: null },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

const columns: TableColumn<Program>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return h(
        NuxtLink,
        {
          class: 'font-medium text-gray-900 dark:text-white hover:text-primary-600',
          href: `/admin/programs/${row.original.id}`,
        },
        row.original.name,
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'subCategory',
    header: 'Sub Category',
    cell: ({ row }) => row.original.subCategory || '-',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      return h(
        UBadge,
        {
          color: row.original.isActive ? 'green' : 'gray',
          variant: 'subtle',
          size: 'xs',
        },
        () => (row.original.isActive ? 'Active' : 'Inactive'),
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      return row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString()
        : '-';
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const items = [
        [
          {
            label: 'Edit',
            icon: 'i-lucide-edit',
            click: () => navigateTo(`/admin/programs/${row.original.id}`),
          },
          {
            label: row.original.isActive ? 'Deactivate' : 'Activate',
            icon: row.original.isActive ? 'i-lucide-x-circle' : 'i-lucide-check-circle',
            click: () => handleToggleStatus(row.original),
          },
        ],
        [
          {
            label: 'View Applications',
            icon: 'i-lucide-file-text',
            click: () => navigateTo(`/admin/applications?programId=${row.original.id}`),
          },
        ],
        [
          {
            label: 'Delete',
            icon: 'i-lucide-trash-2',
            click: () => handleDelete(row.original),
            class: 'text-red-600 dark:text-red-400',
          },
        ],
      ];

      return h(
        UDropdown,
        {
          items,
          popper: { placement: 'bottom-end' },
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-more-vertical',
            size: 'xs',
            color: 'gray',
            variant: 'ghost',
            onClick: (e: Event) => e.stopPropagation(),
          }),
      );
    },
  },
];

const filteredPrograms = computed(() => {
  let result = programsStore.programs;

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower),
    );
  }

  // Category filter
  if (selectedCategory.value) {
    result = result.filter((p) => p.category === selectedCategory.value);
  }

  // Status filter
  if (selectedStatus.value !== null) {
    result = result.filter((p) => p.isActive === selectedStatus.value);
  }

  return result;
});

const fetchPrograms = async () => {
  try {
    await programsStore.fetchPrograms();
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to load programs',
      color: 'red',
    });
  }
};

const handleToggleStatus = async (program: Program) => {
  try {
    await programsStore.toggleProgramStatus(program.id);
    toast.add({
      title: 'Success',
      description: `Program ${program.isActive ? 'deactivated' : 'activated'} successfully`,
      color: 'green',
    });
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to toggle program status',
      color: 'red',
    });
  }
};

const handleDelete = (program: Program) => {
  programToDelete.value = program;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!programToDelete.value) return;

  try {
    await programsStore.deleteProgram(programToDelete.value.id);
    toast.add({
      title: 'Success',
      description: 'Program deleted successfully',
      color: 'green',
    });
    showDeleteModal.value = false;
    programToDelete.value = null;
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete program',
      color: 'red',
    });
  }
};

function onSelect(event: Event, row: TableRow<Program>) {
  const program = row.original;
  navigateTo(`/admin/programs/${program.id}`);
}

onMounted(() => {
  fetchPrograms();
});
</script>
