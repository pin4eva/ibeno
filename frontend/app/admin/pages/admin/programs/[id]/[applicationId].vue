<script setup lang="ts">
import { ApplicationStatusEnum, type Application } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';

useSeoMeta({
  title: 'Application',
});

const route = useRoute();
const toast = useToast();

const programId = Number(route.params.id);
const applicationId = Number(route.params.applicationId);

if (!Number.isFinite(programId) || !Number.isFinite(applicationId)) {
  throw createError({ statusCode: 404, statusMessage: 'Application not found' });
}

const {
  data: app,
  pending,
  error,
  refresh,
} = await useAsyncData(`admin-program-${programId}-application-${applicationId}`, () =>
  apiFetch<Application>(`/applications/single/${applicationId}`),
);

type ErrorWithMessage = { message?: string };
function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

async function updateStatus(newStatus: ApplicationStatusEnum) {
  if (!app.value) return;
  try {
    await apiFetch('/applications', {
      method: 'POST',
      body: {
        ...app.value,
        status: newStatus,
      },
    });
    toast.add({ title: 'Updated', description: `Status updated to ${newStatus}` });
    refresh();
  } catch (e: unknown) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(e, 'Failed to update status'),
      color: 'red',
    });
  }
}

const tabs = [
  { label: 'Personal', slot: 'personal' },
  { label: 'Education', slot: 'education' },
  { label: 'Documents', slot: 'documents' },
  { label: 'Bank', slot: 'bank' },
  { label: 'Review', slot: 'review' },
];

const docs = computed(() => {
  if (!app.value) return [] as Array<{ label: string; url: string; kind: 'image' | 'link' }>;

  const items: Array<{ label: string; url: string; kind: 'image' | 'link' }> = [];

  if (app.value.passport) items.push({ label: 'Passport', url: app.value.passport, kind: 'image' });
  if (app.value.admissionLeterUrl)
    items.push({ label: 'Admission Letter', url: app.value.admissionLeterUrl, kind: 'link' });
  if (app.value.lastSchoolFeeReceiptUrl)
    items.push({
      label: 'Last School Fee Receipt',
      url: app.value.lastSchoolFeeReceiptUrl,
      kind: 'link',
    });
  if (app.value.certificateOfOriginUrl)
    items.push({
      label: 'Certificate of Origin',
      url: app.value.certificateOfOriginUrl,
      kind: 'link',
    });
  if (app.value.ssceResultUrl)
    items.push({ label: 'SSCE Result', url: app.value.ssceResultUrl, kind: 'link' });

  return items;
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          Application<span v-if="app?.applicationNo">: {{ app.applicationNo }}</span>
        </h1>
        <div class="mt-2 flex items-center gap-2">
          <UBadge size="lg">{{ app?.status || '-' }}</UBadge>
          <UButton
            icon="i-lucide-arrow-left"
            color="gray"
            variant="ghost"
            label="Back to Program"
            :to="`/admin/programs/${programId}`"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            color="gray"
            variant="outline"
            label="Refresh"
            :loading="pending"
            @click="refresh()"
          />
        </div>
      </div>

      <div v-if="app" class="flex gap-2">
        <UButton
          v-if="app.status !== 'Accepted'"
          color="green"
          @click="updateStatus(ApplicationStatusEnum.Accepted)"
        >
          Approve
        </UButton>
        <UButton
          v-if="app.status !== 'Rejected'"
          color="red"
          variant="soft"
          @click="updateStatus(ApplicationStatusEnum.Rejected)"
        >
          Reject
        </UButton>
      </div>
    </div>

    <UCard v-if="error">
      <template #header>
        <h3 class="font-semibold">Could not load application</h3>
      </template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ getErrorMessage(error, 'Please try again.') }}
      </p>
    </UCard>

    <div v-else-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <UCard v-else-if="app">
      <UTabs :items="tabs" class="w-full">
        <template #personal>
          <UCard>
            <template #header><h3 class="font-semibold">Personal</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">Full Name</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.firstName }} {{ app.middleName }} {{ app.lastName }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Email</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.email }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Phone</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.phone }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">NIN</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.nin }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">DOB</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.dob ? new Date(app.dob).toLocaleDateString() : '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Gender</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.gender }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Address</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.address || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">State / LGA</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.state || '-' }}<span v-if="app.lga"> / {{ app.lga }}</span>
                </dd>
              </div>
            </dl>
          </UCard>
        </template>

        <template #education>
          <UCard>
            <template #header><h3 class="font-semibold">Education</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">School</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.school || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Faculty</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.faculty || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Department</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.department || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Reg No</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.regNo || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Level</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.level ?? '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Program duration</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.programDuration ?? '-' }}
                </dd>
              </div>
            </dl>
          </UCard>
        </template>

        <template #documents>
          <UCard>
            <template #header><h3 class="font-semibold">Documents</h3></template>
            <div v-if="docs.length" class="space-y-4">
              <div v-for="d in docs" :key="d.label" class="space-y-2">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ d.label }}</p>
                <img v-if="d.kind === 'image'" :src="d.url" class="w-full max-w-md rounded-lg" />
                <UButton
                  v-else
                  :to="d.url"
                  target="_blank"
                  variant="link"
                  icon="i-lucide-external-link"
                >
                  View Document
                </UButton>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">No documents uploaded.</p>
          </UCard>
        </template>

        <template #bank>
          <UCard>
            <template #header><h3 class="font-semibold">Bank</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">Bank name</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.bankName || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Account number</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.accountNumber || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Account name</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.accountName || '-' }}
                </dd>
              </div>
            </dl>
          </UCard>
        </template>

        <template #review>
          <UCard>
            <template #header><h3 class="font-semibold">Review</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">Application No</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.applicationNo || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Status</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.status || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Created</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.createdAt ? new Date(app.createdAt).toLocaleString() : '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Updated</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.updatedAt ? new Date(app.updatedAt).toLocaleString() : '-' }}
                </dd>
              </div>
            </dl>
          </UCard>
        </template>
      </UTabs>
    </UCard>
  </div>
</template>
