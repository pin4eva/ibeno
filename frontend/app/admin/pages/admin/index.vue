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
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="block transition-transform hover:scale-105"
      >
        <UCard class="cursor-pointer">
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
            <span class="font-medium text-gray-600 dark:text-gray-400">
              {{ stat.change }}
            </span>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';
import { useProgramsStore } from '~/stores/programs.store';
import { useUserStore } from '~/stores/user.store';

const authStore = useAuthStore();
const programsStore = useProgramsStore();
const userStore = useUserStore();

const stats = computed(() => [
  {
    label: 'Total Programs',
    value: programsStore.stats.total > 0 ? programsStore.stats.total.toString() : '0',
    change: `${programsStore.stats.active} active`,
    icon: 'i-lucide-folder',
    to: '/admin/programs',
  },
  {
    label: 'Total Applications',
    value: '0',
    change: 'All programs',
    icon: 'i-lucide-file-text',
    to: '/admin/programs',
  },
  {
    label: 'Total Users',
    value: userStore.total > 0 ? userStore.total.toString() : '0',
    change: 'System users',
    icon: 'i-lucide-users',
    to: '/admin/users',
  },
  {
    label: 'Active Programs',
    value: programsStore.stats.active > 0 ? programsStore.stats.active.toString() : '0',
    change: `${programsStore.stats.inactive} inactive`,
    icon: 'i-lucide-check-circle',
    to: '/admin/programs',
  },
]);

const fetchDashboardData = async () => {
  try {
    // Fetch programs
    await programsStore.fetchPrograms();

    // Fetch users count
    await userStore.fetchUsers({ page: 1, limit: 1 });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>
