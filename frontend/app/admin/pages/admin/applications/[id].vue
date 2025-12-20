<script setup lang="ts">
import { ApplicationStatusEnum, type Application } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';

const route = useRoute();
const toast = useToast();
const applicationId = parseInt(route.params.id as string);

const { data: app, refresh } = await useAsyncData(`admin-application-${applicationId}`, () =>
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
    // Assuming the backend accepts partial updates via POST to /api/applications
    // We need to send programId because ApplicationDTO might require it, or we need to make it optional in DTO for updates if ID is present.
    // Based on ApplicationDTO, programId is required. So we must include it.
    await apiFetch('/applications', {
      method: 'POST',
      body: {
        ...app.value,
        status: newStatus,
      },
    });
    toast.add({ title: 'Updated', description: `Status updated to ${newStatus}` });
    refresh();
  } catch (error: unknown) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(error, 'Failed to update status'),
      color: 'red',
    });
  }
}
</script>

<template>
  <UContainer class="py-8" v-if="app">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Application: {{ app.applicationNo }}</h1>
        <UBadge size="lg" class="mt-2">{{ app.status }}</UBadge>
      </div>
      <div class="flex gap-2">
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header><h3 class="font-semibold">Personal Information</h3></template>
          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-gray-500">Full Name</dt>
              <dd>{{ app.firstName }} {{ app.middleName }} {{ app.lastName }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Email</dt>
              <dd>{{ app.email }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Phone</dt>
              <dd>{{ app.phone }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">NIN</dt>
              <dd>{{ app.nin }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">DOB</dt>
              <dd>{{ app.dob }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Gender</dt>
              <dd>{{ app.gender }}</dd>
            </div>
          </dl>
        </UCard>

        <UCard>
          <template #header><h3 class="font-semibold">Education</h3></template>
          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-gray-500">School</dt>
              <dd>{{ app.school }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Faculty</dt>
              <dd>{{ app.faculty }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Department</dt>
              <dd>{{ app.department }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Reg No</dt>
              <dd>{{ app.regNo }}</dd>
            </div>
          </dl>
        </UCard>
      </div>

      <!-- Sidebar / Documents -->
      <div class="space-y-6">
        <UCard>
          <template #header><h3 class="font-semibold">Documents</h3></template>
          <div class="space-y-4">
            <div v-if="app.passport">
              <p class="text-sm font-medium mb-1">Passport</p>
              <img :src="app.passport" class="w-full rounded-lg" />
            </div>
            <div v-if="app.admissionLeterUrl">
              <p class="text-sm font-medium mb-1">Admission Letter</p>
              <UButton
                :to="app.admissionLeterUrl"
                target="_blank"
                variant="link"
                icon="i-heroicons-document"
                >View Document</UButton
              >
            </div>
            <!-- Add other docs similarly -->
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
