<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {{ authStore.user?.firstName || 'User' }}
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Here's an overview of your programs and applications.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label" class="cursor-pointer hover:shadow-lg transition-shadow" @click="stat.onClick">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stat.value }}
            </p>
          </div>
          <UIcon :name="stat.icon" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-gray-500 dark:text-gray-400">{{ stat.description }}</span>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-folder" class="w-5 h-5 text-primary-500" />
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Programs
            </h3>
          </div>
        </template>
        <div class="space-y-3">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Manage educational and community programs
          </p>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="solid"
              label="Create Program"
              to="/admin/programs/create"
              size="xs"
            />
            <UButton
              icon="i-lucide-list"
              color="gray"
              variant="ghost"
              label="View All"
              to="/admin/programs"
              size="xs"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="w-5 h-5 text-primary-500" />
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Applications
            </h3>
          </div>
        </template>
        <div class="space-y-3">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Review and manage program applications
          </p>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-list"
              color="gray"
              variant="ghost"
              label="View All"
              to="/admin/applications"
              size="xs"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="w-5 h-5 text-primary-500" />
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Users
            </h3>
          </div>
        </template>
        <div class="space-y-3">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Manage system users and permissions
          </p>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-user-plus"
              color="primary"
              variant="solid"
              label="Add User"
              to="/admin/users/create"
              size="xs"
            />
            <UButton
              icon="i-lucide-list"
              color="gray"
              variant="ghost"
              label="View All"
              to="/admin/users"
              size="xs"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity Placeholder -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Recent Applications
          </h3>
          <UButton variant="ghost" color="gray" to="/admin/applications">View all</UButton>
        </div>
      </template>

      <div
        v-if="!recentApplications || recentApplications.length === 0"
        class="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div class="text-center">
          <UIcon name="i-lucide-file-text" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            No recent applications
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Applications will appear here once users start applying.
          </p>
        </div>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="app in recentApplications"
          :key="app.id"
          class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
          @click="navigateTo(`/admin/applications/${app.id}`)"
        >
          <div class="flex items-center gap-3">
            <UAvatar :alt="app.firstName" size="sm" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ app.firstName }} {{ app.lastName }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ app.email }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UBadge :color="getStatusColor(app.status)" variant="subtle" size="xs">
              {{ app.status }}
            </UBadge>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(app.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';
import { useProgramsStore } from '~/stores/programs.store';
import type { Application } from '~/interfaces/application.interface';
import { ApplicationStatusEnum } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';

const authStore = useAuthStore();
const programsStore = useProgramsStore();
const router = useRouter();

const recentApplications = ref<Application[]>([]);

const stats = computed(() => [
  {
    label: 'Total Programs',
    value: programsStore.stats.total,
    description: 'All programs in system',
    icon: 'i-lucide-folder',
    onClick: () => router.push('/admin/programs'),
  },
  {
    label: 'Active Programs',
    value: programsStore.stats.active,
    description: 'Currently accepting applications',
    icon: 'i-lucide-check-circle',
    onClick: () => router.push('/admin/programs'),
  },
  {
    label: 'Applications',
    value: recentApplications.value.length,
    description: 'Recent applications',
    icon: 'i-lucide-file-text',
    onClick: () => router.push('/admin/applications'),
  },
  {
    label: 'Pending Review',
    value: recentApplications.value.filter(
      (a) => a.status === ApplicationStatusEnum.Submitted,
    ).length,
    description: 'Awaiting review',
    icon: 'i-lucide-clock',
    onClick: () => router.push('/admin/applications'),
  },
]);

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

const formatDate = (date?: string) => {
  if (!date) return '-';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
};

const loadDashboardData = async () => {
  try {
    // Load programs stats
    await programsStore.fetchPrograms();
    
    // Load recent applications (last 10)
    const apps = await apiFetch<Application[]>('/applications');
    recentApplications.value = apps.slice(0, 10);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>
