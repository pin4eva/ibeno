<script setup lang="ts">
import type { Application } from '~/interfaces/application.interface';
import type { Program } from '~/interfaces/programs.interface';
import { apiFetch } from '~/utils/api-fetch';

useSeoMeta({
  title: 'Program Applications',
});

type ErrorWithMessage = { message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

const route = useRoute();
const programId = computed(() => Number(route.params.id));

if (!Number.isFinite(programId.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found' });
}

const {
  data,
  status: loadStatus,
  error: loadError,
} = await useAsyncData(`admin-program-${programId.value}-applications`, async () => {
  try {
    const [program, applications] = await Promise.all([
      apiFetch<Program>(`/programs/single/${programId.value}`),
      apiFetch<Application[]>(`/applications?programId=${programId.value}`),
    ]);
    return {
      program,
      applications,
    };
  } catch (error) {
    console.error(error);
    return {
      program: null,
      applications: [],
    };
  }
});

const program = computed(() => data.value?.program || null);
const applications = computed(() => data.value?.applications || []);
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Applications</h1>
        <p v-if="program" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ program.name }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-arrow-left"
          color="gray"
          variant="ghost"
          label="Back to Program"
          :to="`/admin/programs/${programId}`"
        />
      </div>
    </div>

    <UCard v-if="loadError">
      <template #header>
        <h3 class="font-semibold">Could not load applications</h3>
      </template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ getErrorMessage(loadError, 'Please try again.') }}
      </p>
    </UCard>

    <div v-else-if="loadStatus === 'pending'" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <ApplicationsTable
      v-else
      :applications="applications"
      :pending="false"
      :program-id="programId"
    />
  </div>
</template>
