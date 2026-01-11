<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Application } from '~/interfaces/application.interface';
import { UserRoleEnum } from '~/interfaces/user.interface';
import { ApplicationStatusEnum } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';

const selectedStatus = ref<'All' | ApplicationStatusEnum>('All');
const statusOptions = computed(() => {
  const items = Object.values(ApplicationStatusEnum).map((s) => ({ label: s, value: s }));
  return [{ label: 'All', value: 'All' }, ...items];
});

const props = defineProps<{
  applications: Application[];
  pending: boolean;
  programId: number;
}>();

const NuxtLink = resolveComponent('NuxtLink');
const emit = defineEmits<{
  (e: 'deleted'): void;
  (e: 'status-changed', status: 'All' | ApplicationStatusEnum): void;
}>();

const applicationSearch = ref('');
const selectedIds = ref<Set<number>>(new Set());
const isDeleteModalOpen = ref(false);
const isBulkDeleting = ref(false);
const applicationPage = ref(1);

const applicationPageSize = ref(10);
const pageSizeOptions = [5, 10, 20, 50].map((value) => ({ label: `${value} / page`, value }));

const filteredApplications = computed(() => {
  const q = applicationSearch.value.trim().toLowerCase();

  // start from program-level applications
  let list = props.applications;

  // apply status filter
  if (selectedStatus.value !== 'All') {
    list = list.filter((a) => (a.status || '') === selectedStatus.value);
  }

  if (!q) return list;

  return list.filter((a) => {
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

watch(selectedStatus, () => {
  applicationPage.value = 1;
  // notify parent if they care
  emit('status-changed', selectedStatus.value);
});

watch(applicationPageSize, () => {
  applicationPage.value = 1;
});

// Expose a method to retrieve filtered applications for exports
function getFilteredApplications() {
  return filteredApplications.value;
}

defineExpose({ getFilteredApplications });

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

function arrayToCSV(rows: Record<string, any>[], columns: { label: string; key: string }[]) {
  if (!rows || rows.length === 0) return '';
  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key] ?? '';
        const out =
          val instanceof Date ? val.toISOString() : typeof val === 'string' ? val : String(val);
        return `"${out.replace(/"/g, '""')}"`;
      })
      .join(','),
  );
  return [header, ...lines].join('\n');
}

async function exportApplicationsCSV() {
  try {
    const applicationRows = filteredApplications.value;
    if (!applicationRows || applicationRows.length === 0) {
      toast.add({ title: 'No data', description: 'No applications to export', color: 'warning' });
      return;
    }
    const rows = applicationRows.map((a) => ({
      ...a,
      ...a.bankDetails,
      ...a.schoolRecord,
      createdAt: a.createdAt ? new Date(a.createdAt).toLocaleString() : '-',
      updatedAt: a.updatedAt ? new Date(a.updatedAt).toLocaleString() : '-',
    }));

    const columns = [
      { label: 'Application No', key: 'applicationNo' },
      { label: 'First Name', key: 'firstName' },
      { label: 'Middle Name', key: 'middleName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Email', key: 'email' },
      { label: 'Phone', key: 'phone' },
      { label: 'Gender', key: 'gender' },
      { label: 'Date of Birth', key: 'dob' },
      { label: 'NIN', key: 'nin' },
      { label: 'State', key: 'state' },
      { label: 'LGA', key: 'lga' },
      { label: 'Ekpuk', key: 'ekpuk' },
      { label: 'Address', key: 'address' },
      { label: 'School', key: 'school' },
      { label: 'Department', key: 'department' },
      { label: 'Current Level', key: 'level' },
      { label: 'Program Duration', key: 'programDuration' },
      { label: 'Registration No.', key: 'regNo' },
      { label: 'Bank Name', key: 'bankName' },
      { label: 'Account Number', key: 'accountNo' },

      { label: 'Status', key: 'status' },
      { label: 'Decision', key: 'decisionMade' },
      { label: 'Submitted', key: 'createdAt' },
      { label: 'Updated', key: 'updatedAt' },
    ];

    const csv = arrayToCSV(rows, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `applications-${props.programId}-${ts}.csv`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.add({
      title: 'Exported',
      description: `${rows.length} applications exported`,
      color: 'success',
    });
  } catch (err) {
    toast.add({
      title: 'Export failed',
      description: getErrorMessage(err, 'Could not export applications'),
      color: 'error',
    });
  }
}

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
          <USelect
            v-model="selectedStatus"
            :items="statusOptions"
            size="sm"
            placeholder="All statuses"
            class="w-44"
          />
          <RoleGuard :roles="[UserRoleEnum.Admin]">
            <UButton
              icon="i-lucide-download"
              color="primary"
              variant="solid"
              :disabled="filteredApplications.length === 0"
              @click="exportApplicationsCSV"
            >
              Export CSV
            </UButton>
          </RoleGuard>
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
