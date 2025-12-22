<script setup lang="ts">
import type { Program } from '~/interfaces/programs.interface';
import { apiFetch } from '~/utils/api-fetch';
import { stripHtml } from '~/utils/html';

useSeoMeta({
  title: 'Programs',
});

type ErrorWithMessage = { message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

function excerpt(text: string, max = 160): string {
  const plain = stripHtml(text);
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}…`;
}

const {
  data: programs,
  status,
  error,
  refresh,
} = await useAsyncData(
  'programs-active',
  () => apiFetch<Program[]>('/programs', { query: { isActive: true } }),
  { default: () => [] },
);
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Programs</h1>
        <p class="mt-1 text-sm text-muted">Choose an active program to apply.</p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          to="/applications"
          color="gray"
          variant="ghost"
          icon="i-lucide-clipboard-list"
          class="hidden sm:flex"
        >
          Check Status
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          :loading="status === 'pending'"
          @click="refresh()"
        >
          Refresh
        </UButton>
      </div>
    </div>

    <UCard v-if="error" class="mt-6">
      <template #header>
        <h2 class="font-semibold">Could not load programs</h2>
      </template>

      <p class="text-sm text-muted">{{ getErrorMessage(error, 'Please try again.') }}</p>
    </UCard>

    <UCard v-else-if="status === 'pending'" class="mt-6">
      <p class="text-sm text-muted">Loading programs…</p>
    </UCard>

    <UCard v-else-if="programs.length === 0" class="mt-6">
      <p class="text-sm text-muted">No active programs are available right now.</p>
    </UCard>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="program in programs" :key="program.id" class="flex h-full flex-col">
        <template #header>
          <div class="space-y-1">
            <h2 class="font-semibold">{{ program.name }}</h2>
            <p class="text-sm text-muted">
              {{ program.category }}
              <span v-if="program.subCategory"> • {{ program.subCategory }}</span>
            </p>
          </div>
        </template>

        <p class="text-sm text-muted">{{ excerpt(program.description || '') }}</p>

        <template #footer>
          <div class="flex items-center justify-end">
            <UButton :to="`/programs/${program.id}`">Apply Now</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
