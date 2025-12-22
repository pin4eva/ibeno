<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <!-- Mobile Sidebar Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
      @click="isOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div
          class="flex items-center justify-center h-16 px-6 border-b border-gray-200 dark:border-gray-700"
        >
          <img src="/assets/images/logo.png" alt="logo" class="dashboard-logo" />
          <span class="text-xl font-bold text-primary-600 dark:text-primary-400">Ibeno</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <UNavigationMenu :items="links" orientation="vertical" />
        </nav>

        <!-- User Profile (Bottom of sidebar) -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <UAvatar :alt="authStore.user?.firstName" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
            <UButton
              icon="i-lucide-log-out"
              color="gray"
              variant="ghost"
              size="xs"
              @click="handleLogout"
            />
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex flex-col flex-1 w-0 overflow-hidden">
      <!-- Mobile Header -->
      <header
        class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:hidden user-select-none"
      >
        <UButton icon="i-lucide-menu" color="gray" variant="ghost" @click="isOpen = true" />
        <span class="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</span>
        <div class="w-8"></div>
        <!-- Spacer for alignment -->
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

const isOpen = ref(false);
const authStore = useAuthStore();
const router = useRouter();

// Close sidebar on route change
router.afterEach(() => {
  isOpen.value = false;
});

const links = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin',
  },
  {
    label: 'Programs',
    icon: 'i-lucide-folder',
    to: '/admin/programs',
  },
  {
    label: 'Procurement',
    icon: 'i-lucide-briefcase',
    children: [
      { label: 'Procurements', to: '/admin/procurements', icon: 'i-lucide-files' },
      { label: 'Contractors', to: '/admin/contractors', icon: 'i-lucide-building-2' },
      { label: 'Bids', to: '/admin/procurements/bids', icon: 'i-lucide-file-text' },
    ],
  },
  {
    label: 'Assets',
    icon: 'i-lucide-package',
    to: '/admin/assets',
  },
  {
    label: 'Users',
    icon: 'i-lucide-users',
    children: [
      { label: 'All Users', to: '/admin/users', icon: 'i-lucide-users' },
      { label: 'Invitations', to: '/admin/users/invitations', icon: 'i-lucide-mail' },
    ],
  },
  {
    label: 'Profile',
    icon: 'i-lucide-settings',
    to: '/admin/profile',
  },
];

function handleLogout() {
  // Implement logout logic here
  // authStore.logout();
  router.push('/auth/login');
}
</script>

<style>
.dashboard-logo {
  height: 32px;
  width: 32px;
  object-fit: contain;
}
</style>
