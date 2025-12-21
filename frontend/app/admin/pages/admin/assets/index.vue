<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Assets</h2>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        variant="solid"
        label="Create Asset"
        to="/admin/assets/create"
      />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assets</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ assetsStore.stats.total }}
            </p>
          </div>
          <UIcon name="i-lucide-package" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">With Images</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ assetsStore.stats.withImages }}
            </p>
          </div>
          <UIcon name="i-lucide-image" class="w-8 h-8 text-green-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Locations</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ assetsStore.stats.locations }}
            </p>
          </div>
          <UIcon name="i-lucide-map-pin" class="w-8 h-8 text-blue-500 opacity-80" />
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
            placeholder="Search by name or asset number..."
            class="w-64"
          />
          <USelectMenu
            v-model="selectedLocation"
            :items="locationOptions"
            placeholder="All Locations"
            class="w-48"
            value-key="value"
          />
          <UButton
            v-if="search || selectedLocation"
            icon="i-lucide-x"
            color="gray"
            variant="ghost"
            label="Clear"
            @click="clearFilters"
          />
        </div>
      </template>

      <UTable
        :data="filteredAssets"
        :columns="columns"
        :loading="assetsStore.loading"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { useAssetsStore, type Asset } from '~/stores/assets.store';

const assetsStore = useAssetsStore();
const search = ref('');
const selectedLocation = ref<string | undefined>(undefined);

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const UAvatar = resolveComponent('UAvatar');

// Fetch assets on mount
onMounted(async () => {
  await assetsStore.fetchAssets();
});

// Filter assets
const filteredAssets = computed(() => {
  let result = assetsStore.assets;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.assetNumber.toLowerCase().includes(searchLower)
    );
  }

  if (selectedLocation.value) {
    result = result.filter((asset) => asset.location === selectedLocation.value);
  }

  return result;
});

// Get unique locations
const locationOptions = computed(() => {
  const locations = new Set(assetsStore.assets.map((a) => a.location));
  return [
    { label: 'All Locations', value: undefined },
    ...Array.from(locations).map((loc) => ({ label: loc, value: loc })),
  ];
});

// Clear filters
const clearFilters = () => {
  search.value = '';
  selectedLocation.value = undefined;
};

// Table columns
const columns: TableColumn<Asset>[] = [
  {
    accessorKey: 'imageUrl',
    header: 'Image',
    cell: ({ row }) =>
      h(UAvatar, {
        src: row.original.imageUrl || undefined,
        alt: row.original.name,
        icon: row.original.imageUrl ? undefined : 'i-lucide-package',
        size: 'md',
      }),
  },
  {
    accessorKey: 'assetNumber',
    header: 'Asset Number',
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: 'primary',
          variant: 'subtle',
        },
        () => row.original.assetNumber
      ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = row.original.description;
      return desc.length > 50 ? desc.substring(0, 50) + '...' : desc;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'flex gap-2' },
        [
          h(UButton, {
            icon: 'i-lucide-eye',
            size: 'xs',
            color: 'primary',
            variant: 'ghost',
            to: `/admin/assets/${row.original.id}`,
          }),
          h(UButton, {
            icon: 'i-lucide-trash',
            size: 'xs',
            color: 'red',
            variant: 'ghost',
            onClick: () => handleDelete(row.original),
          }),
        ]
      ),
  },
];

// Handle delete
const handleDelete = async (asset: Asset) => {
  if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
    try {
      await assetsStore.deleteAsset(asset.id);
      useToast().add({
        title: 'Success',
        description: 'Asset deleted successfully',
        color: 'green',
      });
    } catch (error) {
      useToast().add({
        title: 'Error',
        description: 'Failed to delete asset',
        color: 'red',
      });
    }
  }
};
</script>
