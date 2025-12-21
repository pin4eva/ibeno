<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Applications</h2>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats.total }}
            </p>
          </div>
          <UIcon name="i-lucide-file-text" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats.inProgress }}
            </p>
          </div>
          <UIcon name="i-lucide-clock" class="w-8 h-8 text-yellow-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats.submitted }}
            </p>
          </div>
          <UIcon name="i-lucide-send" class="w-8 h-8 text-blue-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Accepted</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats.accepted }}
            </p>
          </div>
          <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-green-500 opacity-80" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <template #header>
        <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search by name, email, or application number..."
            class="w-full sm:flex-1"
          />
          <USelectMenu
            v-model="programId"
            :options="programOptions"
            placeholder="All Programs"
            class="w-full sm:w-64"
          />
          <USelectMenu
            v-model="status"
            :options="statusOptions"
            placeholder="All Status"
            class="w-full sm:w-48"
          />
        </div>
      </template>

      <UTable
        :data="filteredApplications"
        :columns="columns"
        :loading="pending"
        @select="onSelect"
      />

      <!-- Pagination -->
      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Showing {{ filteredApplications.length }} of {{ (applications || []).length }} applications
          </p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { ApplicationStatusEnum, type Application } from '~/interfaces/application.interface';
import type { Program } from '~/interfaces/programs.interface';

const config = useRuntimeConfig().public;
const apiBaseUrl = config.apiBaseUrl;
const route = useRoute();

const UBadge = resolveComponent('UBadge');
const UAvatar = resolveComponent('UAvatar');
const NuxtLink = resolveComponent('NuxtLink');

const search = ref('');
const status = ref<ApplicationStatusEnum | null>(null);
const programId = ref<number | null>(
  route.query.programId ? Number(route.query.programId) : null,
);

const { data, pending } = useAsyncData(
  async () => {
    try {
      const programs = await $fetch<Program[]>(`${apiBaseUrl}/programs`);
      const queryParams: any = {};
      if (status.value) queryParams.status = status.value;
      if (programId.value) queryParams.programId = programId.value;
      
      const res = await $fetch<Application[]>(`${apiBaseUrl}/applications`, {
        query: queryParams,
      });
      return {
        programs,
        applications: res,
      };
    } catch (error) {
      console.error(error);
      return {
        programs: [],
        applications: [],
      };
    }
  },
  { watch: [status, programId] },
);

const programs = computed(() => data.value?.programs || []);
const applications = computed(() => data.value?.applications || []);

const programOptions = computed(() => {
  return [
    { label: 'All Programs', value: null },
    ...programs.value.map((program) => ({
      label: program.name,
      value: program.id,
    })),
  ];
});

const statusOptions = [
  { label: 'All Status', value: null },
  { label: 'In Progress', value: ApplicationStatusEnum.InProgress },
  { label: 'Submitted', value: ApplicationStatusEnum.Submitted },
  { label: 'Reviewed', value: ApplicationStatusEnum.Reviewed },
  { label: 'Accepted', value: ApplicationStatusEnum.Accepted },
  { label: 'Rejected', value: ApplicationStatusEnum.Rejected },
];

const stats = computed(() => {
  const apps = applications.value;
  return {
    total: apps.length,
    inProgress: apps.filter((a) => a.status === ApplicationStatusEnum.InProgress).length,
    submitted: apps.filter((a) => a.status === ApplicationStatusEnum.Submitted).length,
    accepted: apps.filter((a) => a.status === ApplicationStatusEnum.Accepted).length,
  };
});

const columns: TableColumn<Application>[] = [
  {
    accessorKey: 'applicationNo',
    header: 'Application #',
    cell: ({ row }) => {
      return h(
        NuxtLink,
        {
          class: 'font-medium text-gray-900 dark:text-white hover:text-primary-600',
          href: `/admin/applications/${row.original.id}`,
        },
        row.original.applicationNo,
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Applicant',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UAvatar, { alt: row.original.firstName, size: 'xs' }),
        h('div', {}, [
          h(
            'p',
            { class: 'font-medium text-gray-900 dark:text-white' },
            `${row.original.firstName} ${row.original.lastName}`,
          ),
          h('p', { class: 'text-xs text-gray-500 dark:text-gray-400' }, row.original.email),
        ]),
      ]);
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return h(
        UBadge,
        {
          color: getStatusColor(row.original.status),
          variant: 'subtle',
          size: 'xs',
        },
        () => row.original.status,
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Applied',
    cell: ({ row }) => {
      return row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString()
        : '-';
    },
  },
];

const getStatusColor = (status?: string) => {
  switch (status) {
    case ApplicationStatusEnum.Accepted:
      return 'green';
    case ApplicationStatusEnum.Rejected:
      return 'red';
    case ApplicationStatusEnum.Reviewed:
      return 'blue';
    case ApplicationStatusEnum.Submitted:
      return 'yellow';
    default:
      return 'gray';
  }
};

const filteredApplications = computed(() => {
  let result = applications.value;

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (a) =>
        a.firstName.toLowerCase().includes(searchLower) ||
        a.lastName.toLowerCase().includes(searchLower) ||
        a.email.toLowerCase().includes(searchLower) ||
        a.applicationNo?.toLowerCase().includes(searchLower) ||
        a.phone.toLowerCase().includes(searchLower),
    );
  }

  return result;
});

function onSelect(event: Event, row: TableRow<Application>) {
  const application = row.original;
  navigateTo(`/admin/applications/${application.id}`);
}

// Watch for program filter changes in URL
watch(
  () => route.query.programId,
  (newId) => {
    if (newId) {
      programId.value = Number(newId);
    }
  },
);
</script>
