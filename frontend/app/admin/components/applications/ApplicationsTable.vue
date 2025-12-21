<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Application } from '~/interfaces/application.interface';

const props = defineProps<{
  applications: Application[];
  pending: boolean;
  programId: number;
}>();

const toast = useToast();

const UCheckbox = resolveComponent('UCheckbox');
const NuxtLink = resolveComponent('NuxtLink');

const applicationSearch = ref('');
const applicationPage = ref(1);
const selectedIds = ref<Set<number>>(new Set());
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
const selectedCount = computed(() => selectedIds.value.size);
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

const allPageSelected = computed(
  () =>
    pagedApplications.value.length > 0 &&
    pagedApplications.value.every((app) => (app.id ? selectedIds.value.has(app.id) : false)),
);

const somePageSelected = computed(
  () =>
    pagedApplications.value.some((app) => app.id && selectedIds.value.has(app.id)) &&
    !allPageSelected.value,
);

function toggleSelect(id: number | undefined, checked: boolean) {
  if (!id) return;
  if (checked) {
    selectedIds.value.add(id);
  } else {
    selectedIds.value.delete(id);
  }
}

function toggleSelectAllPage(checked: boolean) {
  pagedApplications.value.forEach((app) => {
    if (!app.id) return;
    if (checked) {
      selectedIds.value.add(app.id);
    } else {
      selectedIds.value.delete(app.id);
    }
  });
}

function handleBulkEmail() {
  if (!selectedIds.value.size) return;
  toast.add({
    title: 'Selection captured',
    description: `${selectedIds.value.size} application${selectedIds.value.size === 1 ? '' : 's'} selected. Integrate email flow here.`,
  });
}

const applicationColumns: TableColumn<Application>[] = [
  {
    id: 'select',
    header: () =>
      h(UCheckbox, {
        modelValue: allPageSelected.value,
        indeterminate: somePageSelected.value,
        'onUpdate:modelValue': (val: boolean) => toggleSelectAllPage(val),
        'aria-label': 'Select all on page',
      }),
    cell: ({ row }) => {
      const checked = computed(() =>
        row.original.id ? selectedIds.value.has(row.original.id) : false,
      );
      return h(UCheckbox, {
        modelValue: checked.value,
        'onUpdate:modelValue': (val: boolean) => toggleSelect(row.original.id, val),
        'aria-label': 'Select row',
      });
    },
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
          <UBadge variant="subtle">{{ filteredApplications.length }}</UBadge>
          <UBadge v-if="selectedCount" color="primary" variant="soft">
            {{ selectedCount }} selected
          </UBadge>
          <UButton
            size="sm"
            color="primary"
            variant="outline"
            :disabled="!selectedCount"
            icon="i-lucide-mail"
            @click="handleBulkEmail"
          >
            Email selected
          </UButton>
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
  </UCard>
</template>
