<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ApplicationsTable from '~/admin/components/applications/ApplicationsTable.vue';
import {
  ProgramCategoryEnum,
  type Program,
  type UpdateProgramDTO,
} from '~/interfaces/programs.interface';
import { apiFetch } from '~/utils/api-fetch';
import { toDateInput } from '~/utils/date';
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
const router = useRouter();
const toast = useToast();

const programId = computed(() => Number(route.params.id));

const {
  data,
  pending: programPending,
  error,
  refresh,
} = useAsyncData(
  `program-${programId.value}`,
  async () => {
    const response = apiFetch<Program>(`/programs/single/${programId.value}`);
    return response;
  },
  {
    watch: [programId],
  },
);

const program = computed(() => data.value ?? null);
const applications = computed(() => program.value?.applications ?? []);
const pending = computed(() => programPending.value);

const isEditOpen = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const isToggling = ref(false);
const isBulkSending = ref(false);
const isBulkResultsOpen = ref(false);
const bulkFailures = ref<Array<{ id: number; email?: string; error?: string }>>([]);

const editForm = ref({
  name: '',
  description: '',
  category: undefined as ProgramCategoryEnum | undefined,
  subCategory: '',
  startDate: '',
  endDate: '',
});

const categoryOptions = Object.values(ProgramCategoryEnum).map((value) => ({
  label: value,
  value,
}));

watch(
  () => program.value,
  (value) => {
    if (!value) return;
    editForm.value = {
      name: value.name,
      description: value.description,
      category: value.category,
      subCategory: value.subCategory || '',
      startDate: value.startDate ? toDateInput(value.startDate) : '',
      endDate: value.endDate ? toDateInput(value.endDate) : '',
    };
  },
  { immediate: true },
);

function openEdit() {
  if (!program.value) return;
  isEditOpen.value = true;
}

async function saveProgram() {
  if (!program.value) return;
  try {
    isSaving.value = true;
    const payload: UpdateProgramDTO = {
      id: programId.value,
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim(),
      category: editForm.value.category!,
      subCategory: editForm.value.subCategory?.trim() || undefined,
      startDate: editForm.value.startDate
        ? new Date(`${editForm.value.startDate}T00:00:00.000Z`).toISOString()
        : undefined,
      endDate: editForm.value.endDate
        ? new Date(`${editForm.value.endDate}T00:00:00.000Z`).toISOString()
        : undefined,
    };

    await apiFetch(`/api/programs/${programId.value}`, { method: 'PATCH', body: payload });
    await refresh();
    toast.add({ title: 'Updated', description: 'Program updated successfully', color: 'success' });
    isEditOpen.value = false;
  } catch (err) {
    toast.add({
      title: 'Update failed',
      description: getErrorMessage(err, 'Unable to update program'),
      color: 'error',
    });
  } finally {
    isSaving.value = false;
  }
}

async function toggleActive() {
  if (!program.value) return;
  try {
    isToggling.value = true;
    await apiFetch(`/programs/${programId.value}/status`, {
      method: 'PATCH',
      body: { isActive: !program.value.isActive },
    });
    await refresh();
    toast.add({
      title: 'Status updated',
      description: `Program ${program.value.isActive ? 'deactivated' : 'activated'} successfully`,
      color: 'success',
    });
  } catch (err) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(err, 'Could not update status'),
      color: 'error',
    });
  } finally {
    isToggling.value = false;
  }
}

async function deleteProgram() {
  if (!program.value) return;
  try {
    isDeleting.value = true;
    await apiFetch(`/programs/${programId.value}`, { method: 'DELETE' });
    toast.add({ title: 'Deleted', description: 'Program removed', color: 'success' });
    router.push('/admin/programs');
  } catch (err) {
    toast.add({
      title: 'Delete failed',
      description: getErrorMessage(err, 'Could not delete program'),
      color: 'error',
    });
  } finally {
    isDeleting.value = false;
  }
}

async function bulkSendStartedEmails() {
  if (!program.value) return;
  try {
    isBulkSending.value = true;
    const res = await apiFetch<{
      total: number;
      success: number;
      failed: number;
      failures: Array<{ id: number; email?: string; error?: string }>;
    }>(`/applications/bulk-send-started/${programId.value}`, {
      method: 'POST',
      body: { origin: window.location.origin },
    });

    if (res.failed && res.failed > 0) {
      bulkFailures.value = res.failures || [];
      isBulkResultsOpen.value = true;
      toast.add({
        title: 'Bulk send completed',
        description: `${res.success} sent, ${res.failed} failed`,
        color: 'warning',
      });
    } else {
      bulkFailures.value = [];
      toast.add({
        title: 'Bulk send completed',
        description: `${res.success} emails sent`,
        color: 'success',
      });
    }
  } catch (err) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(err, 'Could not send emails'),
      color: 'error',
    });
  } finally {
    isBulkSending.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Program</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Read-only view</p>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <UButton
          icon="i-lucide-arrow-left"
          color="gray"
          variant="ghost"
          label="Back"
          to="/admin/programs"
        />

        <UButton
          icon="i-lucide-pencil"
          color="primary"
          variant="solid"
          :disabled="!program"
          @click="openEdit"
        />
        <UButton
          icon="i-lucide-mail"
          color="primary"
          variant="solid"
          :loading="isBulkSending"
          :disabled="!program || isBulkSending"
          @click="bulkSendStartedEmails"
        >
          Send Start Emails
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          :loading="isDeleting"
          :disabled="!program || isDeleting"
          @click="deleteProgram"
        />
      </div>
    </div>

    <UCard v-if="error">
      <template #header>
        <h3 class="font-semibold">Could not load program</h3>
      </template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ getErrorMessage(error, 'Please try again.') }}
      </p>
    </UCard>

    <div v-else-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <UCard v-else-if="program" class="space-y-4">
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ program.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ program.category
              }}<span v-if="program.subCategory"> • {{ program.subCategory }}</span>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              size="sm"
              :color="program.isActive ? 'error' : 'primary'"
              variant="outline"
              :loading="isToggling"
              @click="toggleActive"
            >
              {{ program.isActive ? 'Deactivate' : 'Activate' }}
            </UButton>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Start date</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ program.startDate ? new Date(program.startDate).toLocaleDateString() : '-' }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">End date</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ program.endDate ? new Date(program.endDate).toLocaleDateString() : '-' }}
          </p>
        </div>
      </div>

      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Description</p>
        <div
          class="mt-2 text-sm text-gray-900 dark:text-white"
          v-html="sanitizeHtml(program.description)"
        />
      </div>

      <div
        class="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-2"
      >
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Created</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ program.createdAt ? new Date(program.createdAt).toLocaleString() : '-' }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ program.updatedAt ? new Date(program.updatedAt).toLocaleString() : '-' }}
          </p>
        </div>
      </div>
    </UCard>

    <ApplicationsTable
      v-if="program"
      :applications="applications"
      :pending="pending"
      :program-id="programId"
    />

    <UModal v-model:open="isEditOpen" :ui="{ content: 'w-full sm:max-w-4xl' }">
      <template #header>
        <div class="flex items-start justify-between w-full">
          <div>
            <h3 class="text-lg font-semibold">Update program</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Edit fields and save.</p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="isEditOpen = false" />
        </div>
      </template>

      <template #body>
        <form class="space-y-6" @submit.prevent="saveProgram">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UFormField label="Program name" required>
              <UInput v-model="editForm.name" :disabled="isSaving" required />
            </UFormField>

            <UFormField label="Category" required>
              <USelectMenu
                v-model="editForm.category"
                :items="categoryOptions"
                value-key="value"
                placeholder="Select category"
                :disabled="isSaving"
                required
              />
            </UFormField>

            <UFormField label="Sub-category" hint="Optional">
              <UInput v-model="editForm.subCategory" :disabled="isSaving" />
            </UFormField>

            <UFormField label="Start date" hint="Optional">
              <UInput v-model="editForm.startDate" type="date" :disabled="isSaving" />
            </UFormField>

            <UFormField label="End date" hint="Optional">
              <UInput v-model="editForm.endDate" type="date" :disabled="isSaving" />
            </UFormField>
          </div>

          <UFormField label="Description" required>
            <WysiwygEditor v-model="editForm.description" :disabled="isSaving" />
          </UFormField>

          <div
            class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700"
          >
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              :disabled="isSaving"
              @click="isEditOpen = false"
            >
              Cancel
            </UButton>
            <UButton type="submit" color="primary" :loading="isSaving" :disabled="isSaving">
              Save
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal v-model:open="isBulkResultsOpen" :ui="{ content: 'w-full sm:max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-semibold">Bulk send results</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-lucide-x"
            @click="isBulkResultsOpen = false"
          />
        </div>
      </template>
      <template #body>
        <div v-if="bulkFailures.length === 0" class="p-4 text-sm text-gray-600">
          No failures — all emails sent successfully.
        </div>
        <div v-else class="space-y-3">
          <p class="text-sm text-gray-600">The following emails failed to send:</p>
          <div class="divide-y">
            <div v-for="f in bulkFailures" :key="f.id" class="py-2">
              <p class="font-medium">{{ f.email || 'Unknown' }}</p>
              <p class="text-sm text-muted">{{ f.error }}</p>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
