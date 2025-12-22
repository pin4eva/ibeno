<template>
  <div class="container mx-auto py-8 space-y-6">
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Open Procurements</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Browse and bid on available procurement opportunities
      </p>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex flex-wrap gap-3">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search procurements..."
          class="w-full md:w-64"
        />
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryOptions"
          placeholder="All Categories"
          class="w-full md:w-48"
          value-key="value"
        />
        <USelectMenu
          v-model="selectedLocation"
          :items="locationOptions"
          placeholder="All Locations"
          class="w-full md:w-48"
          value-key="value"
        />
      </div>
    </UCard>

    <!-- Loading State -->
    <div v-if="procurementStore.loading" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      <p class="mt-2 text-gray-600">Loading procurements...</p>
    </div>

    <!-- Procurement List -->
    <div v-else-if="filteredProcurements.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="procurement in filteredProcurements"
        :key="procurement.id"
        class="hover:shadow-lg transition-shadow"
      >
        <div class="space-y-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {{ procurement.title }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">{{ procurement.referenceNo }}</p>
            </div>
            <UBadge color="green" variant="subtle">{{ procurement.status }}</UBadge>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
              <span>{{ procurement.location }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UIcon name="i-lucide-tag" class="w-4 h-4" />
              <span>{{ procurement.category }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UIcon name="i-lucide-calendar" class="w-4 h-4" />
              <span>Deadline: {{ formatDate(procurement.submissionDeadline) }}</span>
            </div>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {{ procurement.description }}
          </p>

          <div class="flex gap-2 pt-4 border-t">
            <UButton
              color="primary"
              variant="solid"
              block
              :to="`/procurement/${procurement.id}`"
            >
              View Details
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <UIcon name="i-lucide-inbox" class="w-16 h-16 mx-auto text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No procurements found</h3>
      <p class="mt-2 text-gray-500">Check back later for new opportunities</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProcurementStore } from '~/stores/procurement/procurement.store';
import { ProcurementStatus } from '~/interfaces/procurement/procurement.interface';

const procurementStore = useProcurementStore();
const toast = useToast();

const search = ref('');
const selectedCategory = ref<string | undefined>(undefined);
const selectedLocation = ref<string | undefined>(undefined);

const categoryOptions = computed(() => {
  const options: { label: string; value: string | undefined }[] = [
    { label: 'All Categories', value: undefined },
  ];
  procurementStore.categories.forEach((cat) => {
    options.push({ label: cat, value: cat });
  });
  return options;
});

const locationOptions = computed(() => {
  const options: { label: string; value: string | undefined }[] = [
    { label: 'All Locations', value: undefined },
  ];
  procurementStore.locations.forEach((loc) => {
    options.push({ label: loc, value: loc });
  });
  return options;
});

const filteredProcurements = computed(() => {
  let filtered = procurementStore.publishedProcurements;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.referenceNo.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower),
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((p) => p.category === selectedCategory.value);
  }

  if (selectedLocation.value) {
    filtered = filtered.filter((p) => p.location === selectedLocation.value);
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

const fetchData = async () => {
  try {
    await procurementStore.fetchProcurements({ status: ProcurementStatus.PUBLISHED });
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

