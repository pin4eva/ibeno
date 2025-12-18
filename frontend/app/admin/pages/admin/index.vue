<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {{ authStore.user?.firstName || 'User' }}
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Here's what's happening with your projects today.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label">
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
          <span
            :class="[
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600',
              'font-medium flex items-center',
            ]"
          >
            <UIcon
              :name="stat.trend === 'up' ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
              class="w-4 h-4 mr-1"
            />
            {{ stat.change }}
          </span>
          <span class="ml-2 text-gray-500 dark:text-gray-400">vs last month</span>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity Placeholder -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <UButton variant="ghost" color="gray" to="#">View all</UButton>
        </div>
      </template>

      <div
        class="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div class="text-center">
          <UIcon name="i-lucide-activity" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            No recent activity
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new project.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

const authStore = useAuthStore();

const stats = [
  {
    label: 'Total Users',
    value: '2,543',
    change: '12%',
    trend: 'up',
    icon: 'i-lucide-users',
  },
  {
    label: 'Active Sessions',
    value: '120',
    change: '5%',
    trend: 'up',
    icon: 'i-lucide-activity',
  },
  {
    label: 'Pending Tasks',
    value: '45',
    change: '2%',
    trend: 'down',
    icon: 'i-lucide-check-square',
  },
  {
    label: 'Revenue',
    value: '$45,230',
    change: '8%',
    trend: 'up',
    icon: 'i-lucide-dollar-sign',
  },
];
</script>
