<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- Mobile Sidebar Backdrop -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- Sidebar -->
    <AdminSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main Content Wrapper -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <AdminHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-4 focus:outline-none sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminHeader from '~/admin/components/AdminHeader.vue';
import AdminSidebar from '~/admin/components/AdminSidebar.vue';

const isSidebarOpen = ref(false);
const router = useRouter();

// Close sidebar on route change
router.afterEach(() => {
  isSidebarOpen.value = false;
});
</script>
