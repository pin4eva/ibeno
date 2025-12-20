<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { ApplicationStatusEnum, type Application } from '~/interfaces/application.interface';
import type { Program } from '~/interfaces/programs.interface';
const config = useRuntimeConfig().public;
const apiBaseUrl = config.apiBaseUrl;
const route = useRoute();

const columns: TableColumn<Application>[] = [
  { accessorKey: 'applicationNo', header: 'App No' },
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'programId', header: 'Program' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'actions', header: 'Actions' },
];

const status = ref<ApplicationStatusEnum | undefined>();
const programId = ref<number | undefined>();

// Initialize programId from query params if present
onMounted(() => {
  if (route.query.programId) {
    programId.value = Number(route.query.programId);
  }
});

const { data, pending } = useAsyncData(
  async () => {
    try {
      const programs = await $fetch<Program[]>(`${apiBaseUrl}/programs`);
      const res = await $fetch<Application[]>(`${apiBaseUrl}/applications`, {
        query: {
          status: status.value,
          programId: programId.value,
        },
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

const programs = computed(() => data.value?.programs);
const applications = computed(() => data.value?.applications);

const programOptions = computed(() => {
  return programs.value?.map((program) => ({
    label: program.name,
    value: program.id,
  }));
});

const statusOptions = Object.values(ApplicationStatusEnum);

function viewApplication(id: number) {
  navigateTo(`/admin/applications/${id}`);
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Applications</h1>
      <div class="flex gap-4">
        <USelect
          v-model="status"
          :items="statusOptions"
          placeholder="Filter by Status"
          class="w-48"
        />
        <!-- Program filter could be dynamic if we fetch programs -->
        <USelectMenu
          v-model="programId"
          :items="programOptions"
          value-key="value"
          placeholder="Program ID"
        />
      </div>
    </div>

    <UCard>
      <UTable :data="applications" :columns="columns" :loading="pending">
        <template #status-cell="{ row }">
          <UBadge
            :color="
              row?.original?.status === ApplicationStatusEnum.Accepted
                ? 'green'
                : row?.original?.status === ApplicationStatusEnum.Rejected
                  ? 'red'
                  : 'orange'
            "
          >
            {{ row?.original?.status }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-eye"
            v-if="row.original?.id"
            @click="viewApplication(row?.original.id)"
          />
        </template>
      </UTable>
    </UCard>
  </UContainer>
</template>
