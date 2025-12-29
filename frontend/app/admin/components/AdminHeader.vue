<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 sm:px-6 lg:px-8"
  >
    <!-- Mobile menu toggle -->
    <UButton
      icon="i-lucide-menu"
      color="gray"
      variant="ghost"
      class="lg:hidden"
      @click="$emit('toggle-sidebar')"
    />

    <div class="flex items-center gap-2 ml-auto sm:gap-4">
      <!-- Notifications -->
      <UButton
        icon="i-lucide-bell"
        color="gray"
        variant="ghost"
        class="relative"
        aria-label="Notifications"
      >
        <span
          class="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"
        />
      </UButton>

      <div class="h-8 w-px bg-gray-200 dark:bg-gray-800" />

      <!-- User dropdown -->
      <UDropdownMenu :items="userMenuItems" :ui="{ content: 'w-56' }">
        <UButton color="gray" variant="ghost" class="gap-2 px-2">
          <UAvatar :src="user?.avatar" :alt="userInitials" size="sm" />
          <div class="hidden text-left sm:block">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ user?.role || 'User' }}
            </p>
          </div>
          <UIcon name="i-lucide-chevron-down" class="size-4 text-gray-500" />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const { user, logout } = useAuth();

const userInitials = computed(() => {
  if (!user.value) return '';
  const first = user.value.firstName?.[0] || '';
  const last = user.value.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase();
});

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: user.value?.email || '',
      type: 'label',
      avatar: {
        src: user.value?.avatar,
        alt: userInitials.value,
      },
    },
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/admin/profile',
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: '/admin/settings',
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      click: logout,
    },
  ],
]);
</script>
