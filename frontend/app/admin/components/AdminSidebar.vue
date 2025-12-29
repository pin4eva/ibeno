<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:relative lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex h-full flex-col">
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 border-b border-gray-200 px-6 dark:border-gray-800">
        <img src="/assets/images/logo.png" alt="IHCDT Logo" class="h-8 w-8 object-contain" />

        <span class="text-xl font-bold text-primary-600 dark:text-primary-400"> IHCDT </span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-4 custom-scrollbar">
        <template v-for="(link, index) in navigationLinks" :key="index">
          <!-- Top-level link without children -->
          <NuxtLink
            v-if="!link.children"
            :to="link.to"
            exact-active-class="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
            class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <UIcon
              v-if="link.icon"
              :name="link.icon"
              class="size-5 shrink-0 text-gray-500 transition-colors group-hover:text-gray-700 group-[.router-link-active]:text-primary-600 dark:text-gray-500 dark:group-hover:text-gray-300 dark:group-[.router-link-active]:text-primary-400"
            />
            <span>{{ link.label }}</span>
          </NuxtLink>

          <!-- Link with children (collapsible) -->
          <div v-else class="space-y-1">
            <button
              type="button"
              class="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              @click="toggleGroup(link.label)"
            >
              <UIcon
                v-if="link.icon"
                :name="link.icon"
                class="size-5 shrink-0 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300"
              />
              <span class="flex-1">{{ link.label }}</span>
              <UIcon
                name="i-lucide-chevron-down"
                :class="[
                  'size-4 text-gray-400 transition-transform duration-200',
                  expandedGroups.has(link.label) ? 'rotate-180' : '',
                ]"
              />
            </button>

            <!-- Children -->
            <div
              v-show="expandedGroups.has(link.label)"
              class="relative ml-4 space-y-1 border-l border-gray-200 pl-4 dark:border-gray-700"
            >
              <NuxtLink
                v-for="child in link.children"
                :key="child.to"
                :to="child.to"
                exact-active-class="text-primary-600 font-semibold dark:text-primary-400"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <UIcon v-if="child.icon" :name="child.icon" class="size-4 shrink-0" />
                <span>{{ child.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </template>
      </nav>

      <!-- Footer / Version -->
      <div class="border-t border-gray-200 p-4 dark:border-gray-800">
        <p class="text-xs text-center text-gray-400 dark:text-gray-500">v1.0.0 &copy; 2025 IHCDT</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface NavigationLink {
  label: string;
  icon?: string;
  to?: string;
  children?: NavigationLink[];
}

defineProps<{
  isOpen: boolean;
}>();

const expandedGroups = ref<Set<string>>(new Set(['Procurement', 'Users']));

const toggleGroup = (label: string) => {
  if (expandedGroups.value.has(label)) {
    expandedGroups.value.delete(label);
  } else {
    expandedGroups.value.add(label);
  }
};

const navigationLinks: NavigationLink[] = [
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
];
</script>
