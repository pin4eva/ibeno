<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { Application } from '~/interfaces/application.interface';
import {
  ProgramCategoryEnum,
  type Program,
  type UpdateProgramDTO,
} from '~/interfaces/programs.interface';
import { useProgramsStore } from '~/stores/programs.store';
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
if (!Number.isFinite(programId.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found' });
}

const programsStore = useProgramsStore();

const { data, pending, error, refresh } = await useAsyncData(
  `admin-program-${programId.value}`,
  async () => {
    const [program, applications] = await Promise.all([
      apiFetch<Program>(`/programs/single/${programId.value}`),
      apiFetch<Application[]>('/applications', { query: { programId: programId.value } }),
    ]);
    return { program, applications };
  },
);

const program = computed(() => data.value?.program || null);
const applications = computed(() => data.value?.applications || []);

const applicationSearch = ref('');
const applicationPage = ref(1);
const applicationPageSize = 10;

const filteredApplications = computed(() => {
  const q = applicationSearch.value.trim().toLowerCase();
  if (!q) return applications.value;

  return applications.value.filter((a) => {
    const fullName = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
    return (
      String(a.applicationNo || '')
        .toLowerCase()
        .includes(q) ||
      fullName.includes(q) ||
      String(a.email || '')
        .toLowerCase()
        .includes(q) ||
      String(a.status || '')
        .toLowerCase()
        .includes(q)
    );
  });
});

const applicationTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredApplications.value.length / applicationPageSize)),
);

const pagedApplications = computed(() => {
  const start = (applicationPage.value - 1) * applicationPageSize;
  return filteredApplications.value.slice(start, start + applicationPageSize);
});

watch(applicationSearch, () => {
  applicationPage.value = 1;
});

watch(
  applicationTotalPages,
  (total) => {
    if (applicationPage.value > total) applicationPage.value = total;
  },
  { immediate: true },
);

const isEditOpen = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const isToggling = ref(false);

const categoryOptions = Object.values(ProgramCategoryEnum).map((cat) => ({
  label: cat,
  value: cat,
}));

const editForm = reactive({
  name: '',
  description: '',
  category: undefined as ProgramCategoryEnum | undefined,
  subCategory: '',
  isActive: true,
  startDate: '',
  endDate: '',
});

function hydrateEditForm() {
  if (!program.value) return;
  editForm.name = program.value.name;
  editForm.description = program.value.description;
  editForm.category = program.value.category;
  editForm.subCategory = program.value.subCategory || '';
  editForm.isActive = !!program.value.isActive;
  editForm.startDate = toDateInput(program.value.startDate || '');
  editForm.endDate = toDateInput(program.value.endDate || '');
}

watch(program, hydrateEditForm, { immediate: true });

function openEdit() {
  hydrateEditForm();
  isEditOpen.value = true;
}

async function saveProgram() {
  if (!program.value) return;

  if (!editForm.category) {
    toast.add({ title: 'Error', description: 'Category is required.', color: 'red' });
    return;
  }

  const payload: UpdateProgramDTO = {
    id: program.value.id,
    name: editForm.name.trim(),
    description: editForm.description.trim(),
    category: editForm.category,
    isActive: editForm.isActive,
    subCategory: editForm.subCategory.trim() ? editForm.subCategory.trim() : undefined,
    startDate: editForm.startDate
      ? new Date(`${editForm.startDate}T00:00:00.000Z`).toISOString()
      : null,
    endDate: editForm.endDate ? new Date(`${editForm.endDate}T00:00:00.000Z`).toISOString() : null,
  };

  try {
    isSaving.value = true;
    await programsStore.updateProgram(payload);
    toast.add({ title: 'Updated', description: 'Program updated successfully.' });
    isEditOpen.value = false;
    await refresh();
  } catch (e: unknown) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(e, 'Failed to update program.'),
      color: 'red',
    });
  } finally {
    isSaving.value = false;
  }
}

async function toggleActive() {
  if (!program.value) return;
  try {
    isToggling.value = true;
    await programsStore.toggleProgramStatus(program.value.id);
    toast.add({ title: 'Updated', description: 'Program status updated.' });
    await refresh();
  } catch (e: unknown) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(e, 'Failed to toggle status.'),
      color: 'red',
    });
  } finally {
    isToggling.value = false;
  }
}

async function deleteProgram() {
  if (!program.value) return;
  if (!confirm(`Delete "${program.value.name}"? This cannot be undone.`)) return;

  try {
    isDeleting.value = true;
    await programsStore.deleteProgram(program.value.id);
    toast.add({ title: 'Deleted', description: 'Program deleted.' });
    router.push('/admin/programs');
  } catch (e: unknown) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(e, 'Failed to delete program.'),
      color: 'red',
    });
  } finally {
    isDeleting.value = false;
  }
}

function viewApplication(id?: number) {
  if (!id) return;
  navigateTo(`/admin/programs/${programId.value}/${id}`);
}

const applicationColumns: TableColumn<Application>[] = [
  { accessorKey: 'applicationNo', header: 'App No' },
  {
    accessorKey: 'name',
    header: 'Applicant',
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
  },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'createdAt',
    header: 'Submitted',
    cell: ({ row }) =>
      row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : '-',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return h(resolveComponent('UButton') as any, {
        color: 'gray',
        variant: 'ghost',
        size: 'xs',
        label: 'View',
        onClick: () => viewApplication(row.original.id),
      });
    },
  },
];
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
          icon="i-lucide-refresh-cw"
          color="gray"
          variant="outline"
          label="Refresh"
          :loading="pending"
          @click="refresh()"
        />
        <UButton
          icon="i-lucide-pencil"
          color="primary"
          variant="solid"
          label="Update"
          :disabled="!program"
          @click="openEdit"
        />
        <UButton
          icon="i-lucide-trash-2"
          color="red"
          variant="soft"
          label="Delete"
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
            <UBadge :color="program.isActive ? 'green' : 'red'" variant="subtle">
              {{ program.isActive ? 'Active' : 'Inactive' }}
            </UBadge>
            <UButton
              size="sm"
              color="gray"
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

    <UCard v-if="program">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Applications</h3>
          <div class="flex items-center gap-2">
            <UInput
              v-model="applicationSearch"
              size="sm"
              placeholder="Search applications"
              icon="i-lucide-search"
              class="w-64"
            />
            <UBadge variant="subtle">{{ filteredApplications.length }}</UBadge>
          </div>
        </div>
      </template>

      <UTable :data="pagedApplications" :columns="applicationColumns" :loading="pending" />

      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-gray-500 dark:text-gray-400">Use “View” to open an application.</p>
          <UPagination
            v-model="applicationPage"
            :page-count="applicationTotalPages"
            :total="filteredApplications.length"
            :items-per-page="applicationPageSize"
          />
        </div>
      </template>
    </UCard>

    <UModal v-model:open="isEditOpen" :ui="{ content: 'w-full sm:max-w-4xl' }">
      <template #header>
        <div class="flex w-full items-start justify-between gap-4">
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
  </div>
</template>
