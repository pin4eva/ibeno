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
          <UIcon name="i-lucide-x-circle" class="w-8 h-8 text-red-500 opacity-80" />
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
            placeholder="Search programs..."
            class="w-64"
          />
          <USelectMenu
            v-model="selectedCategory"
            :items="categoryOptions"
            placeholder="All Categories"
            class="w-48"
            value-attribute="value"
          />
          <USelectMenu
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="All Status"
            class="w-48"
            value-attribute="value"
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
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { useProgramsStore, type Program } from '~/stores/programs.store';
import { ProgramCategoryEnum } from '~/interfaces/programs.interface';
import { useDebounceFn } from '@vueuse/core';

const programsStore = useProgramsStore();
const search = ref('');
const selectedCategory = ref<string | undefined>(undefined);
const selectedStatus = ref<string | undefined>(undefined);

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const UDropdown = resolveComponent('UDropdown');
const NuxtLink = resolveComponent('NuxtLink');

const columns: TableColumn<Program>[] = [
  {
    accessorKey: 'name',
    header: 'Program Name',
    cell: ({ row }) => {
      return h(
        NuxtLink,
        {
          class: 'font-medium text-primary-600 dark:text-primary-400 hover:underline',
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
    header: 'Sub-Category',
    cell: ({ row }) => row.original.subCategory || '-',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      return h(
        UBadge,
        {
          color: row.original.isActive ? 'green' : 'red',
          variant: 'subtle',
          size: 'xs',
        },
        () => (row.original.isActive ? 'Active' : 'Inactive'),
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => {
      if (!row.original.startDate) return '-';
      return new Date(row.original.startDate).toLocaleDateString();
    },
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => {
      if (!row.original.endDate) return '-';
      return new Date(row.original.endDate).toLocaleDateString();
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
            label: 'View Applications',
            icon: 'i-lucide-file-text',
            click: () => navigateTo(`/admin/applications?programId=${row.original.id}`),
          },
        ],
        [
          {
            label: row.original.isActive ? 'Deactivate' : 'Activate',
            icon: row.original.isActive ? 'i-lucide-x-circle' : 'i-lucide-check-circle',
            click: async () => {
              try {
                await programsStore.toggleProgramStatus(row.original.id);
                useToast().add({
                  title: 'Success',
                  description: `Program ${row.original.isActive ? 'deactivated' : 'activated'} successfully`,
                  color: 'green',
                });
              } catch {
                useToast().add({
                  title: 'Error',
                  description: 'Failed to toggle program status',
                  color: 'red',
                });
              }
            },
          },
        ],
        [
          {
            label: 'Delete',
            icon: 'i-lucide-trash-2',
            click: async () => {
              if (
                confirm(
                  `Are you sure you want to delete "${row.original.name}"? This action cannot be undone.`,
                )
              ) {
                try {
                  await programsStore.deleteProgram(row.original.id);
                  useToast().add({
                    title: 'Success',
                    description: 'Program deleted successfully',
                    color: 'green',
                  });
                } catch {
                  useToast().add({
                    title: 'Error',
                    description: 'Failed to delete program',
                    color: 'red',
                  });
                }
              }
            },
          },
        ],
      ];

      return h(UDropdown, {
        items,
        mode: 'hover',
      }, () => h(UButton, {
        icon: 'i-lucide-more-vertical',
        size: 'xs',
        color: 'gray',
        variant: 'ghost',
      }));
    },
  },
];

const categoryOptions = [
  { label: 'All Categories', value: undefined },
  ...Object.values(ProgramCategoryEnum).map((cat) => ({
    label: cat,
    value: cat,
  })),
];

const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

const filteredPrograms = computed(() => {
  let result = programsStore.programs;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.subCategory?.toLowerCase().includes(searchLower),
    );
  }

  return result;
});

const fetchPrograms = async () => {
  const filter: Record<string, string | boolean> = {};

  if (selectedCategory.value) {
    filter.category = selectedCategory.value;
  }

  if (selectedStatus.value !== undefined) {
    filter.isActive = selectedStatus.value === 'true';
  }

  await programsStore.fetchPrograms(filter);
};

// Debounce search
const debouncedSearch = useDebounceFn(() => {
  // Search is done client-side on filtered results
}, 300);

watch(search, debouncedSearch);
watch([selectedCategory, selectedStatus], fetchPrograms);

onMounted(() => {
  fetchPrograms();
});

function onSelect(_event: Event, row: TableRow<Program>) {
  const program = row.original;
  navigateTo(`/admin/programs/${program.id}`);
}
</script>
