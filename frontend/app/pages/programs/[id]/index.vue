<script setup lang="ts">
import type { Program } from '~/interfaces/programs.interface';
import { apiFetch } from '~/utils/api-fetch';
import { sanitizeHtml } from '~/utils/html';

useSeoMeta({
  title: 'Program',
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
  data: program,
  status: programStatus,
  error: programError,
} = await useAsyncData(`program-${route.params.id}`, async () => {
  try {
    const response = await apiFetch<Program>(`/programs/single/${programId.value}`);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

const started = ref(false);
const startedApplicationNo = ref<string | null>(null);
</script>

<template>
  <UContainer class="py-8">
    <UCard v-if="programError">
      <template #header>
        <h1 class="text-2xl font-semibold">Program</h1>
      </template>
      <p class="text-sm text-muted">
        {{ getErrorMessage(programError, 'Failed to load program.') }}
      </p>
    </UCard>

    <UCard v-else-if="programStatus === 'pending'">
      <p class="text-sm text-muted">Loading…</p>
    </UCard>

    <div v-else-if="program" class="space-y-6">
      <UCard v-if="started">
        <template #header>
          <h2 class="text-lg font-semibold">Application started</h2>
        </template>

        <p class="text-sm text-muted">
          We’ve sent your login credentials to your email. Use your Application No as the username
          and your NIN as the password.
        </p>

        <div class="mt-4 flex items-center justify-end">
          <UButton
            :to="{
              path: `/applications`,
              query: startedApplicationNo ? { applicationNo: startedApplicationNo } : {},
            }"
          >
            Continue Application
          </UButton>
        </div>
      </UCard>
      <div class="grid-wrapper" v-else>
        <div>
          <UCard>
            <template #header>
              <div class="space-y-1">
                <h1 class="text-2xl font-semibold">{{ program.name }}</h1>
                <p class="text-sm text-muted">
                  {{ program.category }}
                  <span v-if="program.subCategory"> • {{ program.subCategory }}</span>
                </p>
              </div>
            </template>

            <h3 class="mb-3">Description:</h3>
            <div
              v-if="program.description"
              class="text-sm text-muted"
              v-html="sanitizeHtml(program.description)"
            />
          </UCard>
        </div>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Start application</h2>
          </template>

          <ApplicationsStartApplicationForm
            :program-id="programId"
            @completed="
              (payload: { applicationNo: string | null }) => {
                started = true;
                startedApplicationNo = payload?.applicationNo;
              }
            "
          />
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<style>
.grid-wrapper {
  display: grid;
  gap: 1rem;

  @media screen and (min-width: 786px) {
    grid-template-columns: auto 40%;
  }
}
</style>
