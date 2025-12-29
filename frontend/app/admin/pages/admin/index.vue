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

    <!-- Details -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Recent Programs</h3>
              <UButton
                icon="i-lucide-arrow-right"
                color="gray"
                variant="ghost"
                to="/admin/programs"
              >
                View all
              </UButton>
            </div>
          </template>

          <div class="space-y-3">
            <div v-if="programsStore.programs.length === 0" class="text-sm text-muted p-4">
              No programs yet.
            </div>
            <div v-else class="divide-y">
              <div
                v-for="program in recentPrograms"
                :key="program.id"
                class="flex items-center justify-between py-3"
              >
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ program.name }}</p>
                  <p class="text-sm text-muted">
                    {{ program.category }} • {{ program.subCategory || 'General' }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <UBadge variant="subtle" :color="program.isActive ? 'success' : 'neutral'">{{
                    program.isActive ? 'Active' : 'Inactive'
                  }}</UBadge>
                  <p class="text-sm text-muted">{{ program._count?.applications || 0 }} apps</p>
                  <UButton
                    size="sm"
                    variant="ghost"
                    color="gray"
                    :to="`/admin/programs/${program.id}`"
                    >Manage</UButton
                  >
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Recent Users</h3>
              <UButton icon="i-lucide-arrow-right" color="gray" variant="ghost" to="/admin/users"
                >View all</UButton
              >
            </div>
          </template>

          <div class="space-y-3">
            <div v-if="userStore.users.length === 0" class="text-sm text-muted p-4">
              No users yet.
            </div>
            <div v-else class="divide-y">
              <div
                v-for="u in recentUsers"
                :key="u.id"
                class="flex items-center justify-between py-3"
              >
                <div class="flex items-center gap-3">
                  <UAvatar :alt="u.firstName" :src="u.avatar" size="sm" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ u.firstName }} {{ u.lastName }}
                    </p>
                    <p class="text-sm text-muted">{{ u.email }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge variant="subtle" :color="u.status === 'Active' ? 'success' : 'neutral'">{{
                    u.status
                  }}</UBadge>
                  <UButton size="sm" variant="ghost" color="gray" :to="`/admin/users/${u.id}`"
                    >View</UButton
                  >
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard class="mt-4">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                Pending Invitations
              </h3>
              <UButton
                icon="i-lucide-arrow-right"
                color="gray"
                variant="ghost"
                to="/admin/users/invitations"
                >View</UButton
              >
            </div>
          </template>
          <div class="p-3 text-sm text-muted">
            {{ userStore.invitations.length }} pending invitation(s).
          </div>
        </UCard>
      </div>
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
    value: (
      programsStore.programs.reduce((sum, p) => sum + (p._count?.applications || 0), 0) || 0
    ).toString(),
    change: 'Across all programs',
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
    // Fetch programs (include counts)
    await programsStore.fetchPrograms({});

    // Fetch recent users and counts
    await userStore.fetchUsers({ page: 1, limit: 5 });
    await userStore.fetchCounts();
    await userStore.fetchInvitations();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

const recentPrograms = computed(() => programsStore.programs.slice(0, 5));
const recentUsers = computed(() => userStore.users.slice(0, 5));

onMounted(() => {
  fetchDashboardData();
});
</script>
