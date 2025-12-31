<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Application } from '~/interfaces/application.interface';
import { UserRoleEnum } from '~/interfaces/user.interface';
import { apiFetch } from '~/utils/api-fetch';

const props = defineProps<{
  applications: Application[];
  pending: boolean;
  programId: number;
}>();

const NuxtLink = resolveComponent('NuxtLink');

const applicationSearch = ref('');
const selectedIds = ref<Set<number>>(new Set());
const isDeleteModalOpen = ref(false);
const isBulkDeleting = ref(false);
const applicationPage = ref(1);

const applicationPageSize = ref(10);
const pageSizeOptions = [5, 10, 20, 50].map((value) => ({ label: `${value} / page`, value }));

const filteredApplications = computed(() => {
  const q = applicationSearch.value.trim().toLowerCase();
  if (!q) return props.applications;

  return props.applications.filter((a) => {
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
  Math.max(1, Math.ceil(filteredApplications.value.length / applicationPageSize.value)),
);

const pagedApplications = computed(() => {
  const start = (applicationPage.value - 1) * applicationPageSize.value;
  return filteredApplications.value.slice(start, start + applicationPageSize.value);
});

watch(applicationSearch, () => {
  applicationPage.value = 1;
});

watch(applicationPageSize, () => {
  applicationPage.value = 1;
});

watch(
  applicationTotalPages,
  (total) => {
    if (applicationPage.value > total) applicationPage.value = total;
  },
  { immediate: true },
);

const applicationColumns: TableColumn<Application>[] = [
  {
    accessorKey: 'select',
    header: () =>
      h('input', {
        type: 'checkbox',
        onChange: (e: Event) => {
          const checked = (e.target as HTMLInputElement).checked;
          if (checked) {
            props.applications.forEach((a) => {
              if (a.id) selectedIds.value.add(a.id as number);
            });
          } else {
            selectedIds.value.clear();
          }
        },
      }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        checked: !!row.original.id && selectedIds.value.has(row.original.id as number),
        onChange: (e: Event) => {
          const checked = (e.target as HTMLInputElement).checked;
          const id = row.original.id as number | undefined;
          if (!id) return;
          if (checked) selectedIds.value.add(id);
          else selectedIds.value.delete(id);
        },
      }),
  },
  {
    accessorKey: 'applicationNo',
    header: 'App No',
    cell: ({ row }) => {
      return h(
        NuxtLink,
        { to: `/admin/programs/${props.programId}/applications/${row.original.id}` },
        () => row.original.applicationNo,
      );
    },
  },
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
];

const toast = useToast();

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as { message?: string };
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

const emit = defineEmits<{
  (e: 'deleted'): void;
}>();

async function deleteSelected() {
  if (!selectedIds.value.size) return;
  try {
    isBulkDeleting.value = true;
    const ids = Array.from(selectedIds.value);
    await apiFetch('/applications/bulk-delete', { method: 'DELETE', body: { ids } });
    toast.add({
      title: 'Deleted',
      description: `${ids.length} applications deleted`,
      color: 'success',
    });
    selectedIds.value.clear();
    emit('deleted');
    isDeleteModalOpen.value = false;
  } catch (err) {
    toast.add({
      title: 'Delete failed',
      description: getErrorMessage(err, 'Could not delete applications'),
      color: 'error',
    });
  } finally {
    isBulkDeleting.value = false;
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Applications</h3>
        <div class="flex items-center gap-3 flex-wrap">
          <UInput
            v-model="applicationSearch"
            size="sm"
            placeholder="Search applications"
            icon="i-lucide-search"
            class="w-64"
          />
          <RoleGuard :roles="[UserRoleEnum.Admin]">
            <UButton
              v-if="selectedIds.size"
              icon="i-lucide-trash"
              color="error"
              variant="ghost"
              :label="'Delete ' + selectedIds.size + ' applications'"
              :disabled="selectedIds.size === 0"
              @click="isDeleteModalOpen = true"
            />
          </RoleGuard>
        </div>
      </div>
    </template>
    <UTable :data="pagedApplications" :columns="applicationColumns" :loading="props.pending" />

    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <USelect v-model="applicationPageSize" :items="pageSizeOptions" size="sm" />
        </div>
        <UPagination
          v-model:page="applicationPage"
          :total="filteredApplications.length"
          :items-per-page="applicationPageSize"
        />
      </div>
    </template>
    <UModal v-model:open="isDeleteModalOpen" title="Delete applications">
      <template #header>
        <h3 class="text-lg font-semibold">Delete selected applications</h3>
      </template>
      <template #body>
        <p>
          Are you sure you want to delete {{ selectedIds.size }} selected application(s)? This
          action cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="isDeleteModalOpen = false">Cancel</UButton>
          <UButton color="error" variant="solid" :loading="isBulkDeleting" @click="deleteSelected"
            >Delete</UButton
          >
        </div>
      </template>
    </UModal>
  </UCard>
</template>
