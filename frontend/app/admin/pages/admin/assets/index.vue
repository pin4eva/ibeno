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
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assets</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ assetsStore.total }}
          </p>
        </div>
        <UIcon name="i-lucide-package" class="w-8 h-8 text-primary-500 opacity-80" />
      </div>
    </UCard>

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
          <USelectMenu
            v-model="selectedType"
            :items="typeOptions"
            placeholder="All Types"
            class="w-48"
            value-key="value"
          />
        </div>
      </template>

      <UTable
        :data="filteredAssets"
        :columns="columns"
        :loading="assetsStore.loading"
      >
        <template #imageUrl-data="{ row }">
          <img
            v-if="(row as any).imageUrl"
            :src="(row as any).imageUrl"
            :alt="(row as any).name"
            class="w-12 h-12 rounded object-cover"
          >
          <div
            v-else
            class="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
          >
            <UIcon name="i-lucide-image-off" class="w-6 h-6 text-gray-400" />
          </div>
        </template>

        <template #assetNumber-data="{ row }">
          <span class="font-mono text-sm">{{ (row as any).assetNumber }}</span>
        </template>

        <template #createdAt-data="{ row }">
          {{ formatDate((row as any).createdAt) }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-eye"
              color="primary"
              variant="ghost"
              size="xs"
              :to="`/admin/assets/${(row as any).id}`"
            />
            <UButton
              icon="i-lucide-trash"
              color="red"
              variant="ghost"
              size="xs"
              @click="confirmDelete(row as any)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Confirm Delete</h3>
        </template>

        <p>Are you sure you want to delete asset <strong>{{ assetToDelete?.name }}</strong>?</p>
        <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>

        <template #footer>
          <div class="flex gap-2 justify-end">
            <UButton
              color="gray"
              variant="ghost"
              @click="showDeleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              :loading="assetsStore.loading"
              @click="handleDelete"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useAssetsStore } from '~/stores/assets.store';
import type { Asset } from '~/interfaces/asset.interface';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

const assetsStore = useAssetsStore();
const toast = useToast();

const search = ref('');
const selectedLocation = ref<string | undefined>(undefined);
const selectedType = ref<string | undefined>(undefined);
const showDeleteModal = ref(false);
const assetToDelete = ref<Asset | null>(null);

const columns = [
  { key: 'imageUrl', label: 'Image' },
  { key: 'name', label: 'Name' },
  { key: 'assetNumber', label: 'Asset Number' },
  { key: 'location', label: 'Location' },
  { key: 'assetType', label: 'Type' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: 'Actions' },
] as const;

const locationOptions = computed(() => {
  const options: { label: string; value: string | undefined }[] = [
    { label: 'All Locations', value: undefined },
  ];
  assetsStore.locations.forEach((loc) => {
    options.push({ label: loc, value: loc });
  });
  return options;
});

const typeOptions = computed(() => {
  const options: { label: string; value: string | undefined }[] = [
    { label: 'All Types', value: undefined },
  ];
  assetsStore.assetTypes.forEach((type) => {
    options.push({ label: type, value: type });
  });
  return options;
});

const filteredAssets = computed(() => {
  let filtered = [...assetsStore.assets];

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.assetNumber.toLowerCase().includes(searchLower),
    );
  }

  if (selectedLocation.value) {
    filtered = filtered.filter((asset) => asset.location === selectedLocation.value);
  }

  if (selectedType.value) {
    filtered = filtered.filter((asset) => asset.assetType === selectedType.value);
  }

  return filtered;
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const confirmDelete = (asset: Asset) => {
  assetToDelete.value = asset;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!assetToDelete.value) return;

  try {
    await assetsStore.deleteAsset(assetToDelete.value.id);
    toast.add({
      title: 'Success',
      description: 'Asset deleted successfully',
      color: 'green',
    });
    showDeleteModal.value = false;
    assetToDelete.value = null;
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete asset',
      color: 'red',
    });
  }
};

const fetchData = async () => {
  try {
    await assetsStore.fetchAssets();
    await assetsStore.fetchLocations();
    await assetsStore.fetchAssetTypes();
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to fetch assets',
      color: 'red',
    });
  }
};

onMounted(() => {
  fetchData();
});
</script>
