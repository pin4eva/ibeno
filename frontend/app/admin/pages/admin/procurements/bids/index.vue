<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Procurement</p>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Bids</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Select a procurement to review its bids, change statuses, or export submissions.
        </p>
      </div>
      <UButton to="/admin/procurements" color="primary" icon="i-lucide-briefcase">
        Go to Procurements
      </UButton>
    </div>

    <UCard>
      <div class="flex flex-col items-start gap-3">
        <UIcon name="i-lucide-info" class="w-5 h-5 text-primary-500" />
        <p class="text-sm text-gray-700 dark:text-gray-300">
          Bid management is tied to each procurement. Open a procurement from the list to view and
          manage its bids.
        </p>
        <UButton to="/admin/procurements" variant="outline" color="primary" size="sm">
          View procurements
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// This page keeps the navigation item from pointing to a 404 and guides admins to the
// procurement-level bid review flows.
</script>
