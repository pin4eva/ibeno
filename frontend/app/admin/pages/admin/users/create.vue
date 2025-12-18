<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" to="/admin/users" />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Invite New User</h2>
    </div>

    <UCard>
      <InviteUser />
    </UCard>
  </div>
</template>
