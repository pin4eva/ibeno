<template>
  <UContainer>
    <div class="container mx-auto py-8 space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Open Procurements</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Browse and bid on available procurement opportunities
        </p>
      </div>

      <!-- Procurement List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="procurement in procurements"
          :key="procurement.id"
          class="hover:shadow-lg transition-shadow"
        >
          <div class="grid gap-4" v-if="procurement">
            <div class="flex justify-between mb-3 items-start">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {{ procurement.title }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">{{ procurement.referenceNo }}</p>
              </div>
              <!-- <UBadge color="green" variant="subtle">{{ procurement.status }}</UBadge> -->
            </div>

            <div class="grid gap-2 text-sm">
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
                :color="procurement?.status === ProcurementStatus.PUBLISHED ? 'primary' : 'error'"
                :disabled="procurement?.status !== ProcurementStatus.PUBLISHED"
                :class="procurement?.status !== ProcurementStatus.PUBLISHED ? 'uppercase' : ''"
                variant="solid"
                block
                :to="`/procurement/${procurement.id}`"
              >
                {{
                  procurement?.status === ProcurementStatus.PUBLISHED
                    ? 'View Details'
                    : procurement?.status
                }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import {
  ProcurementStatus,
  type Procurement,
} from '~/interfaces/procurement/procurement.interface';

const route = useRoute();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const { data: procurements } = await useAsyncData(
  'procurements-data',
  async (): Promise<Procurement[]> => {
    try {
      const procurements = await apiFetch<Procurement[]>(`/procurements`, {
        query: {
          // status: ProcurementStatus.PUBLISHED,
          category: route.query?.category || undefined,
          status: route.query?.status || undefined,
        },
      });
      // if (procurements.length) return procurements;
      return procurements?.filter((p) => p.status !== ProcurementStatus.DRAFT) || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
);
</script>
