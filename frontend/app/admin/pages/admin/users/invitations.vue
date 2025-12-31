<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Invitations</h2>
      <UButton
        icon="i-lucide-mail"
        color="primary"
        variant="solid"
        label="Invite User"
        @click="isInviteModalOpen = true"
      />
    </div>

    <UCard>
      <UTable :data="userStore.invitations" :columns="columns" :loading="userStore.loading">
        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'Accepted' ? 'success' : 'yellow'"
            variant="subtle"
            size="xs"
          >
            {{ row.original.status }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              v-if="row.original.status === 'Pending'"
              icon="i-lucide-send"
              size="xs"
              color="gray"
              variant="ghost"
              title="Resend Invitation"
              @click="handleResend(row.original.email)"
            />
            <UButton
              icon="i-lucide-trash"
              size="xs"
              color="red"
              variant="ghost"
              title="Delete Invitation"
              @click="handleDelete(row.original.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Invite User Modal -->
    <UModal v-model:open="isInviteModalOpen" title="Invite User">
      <template #header>
        <h3 class="text-lg font-semibold">Invite User</h3>
      </template>
      <template #body>
        <InviteUser @success="handleInviteSuccess" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useUserStore, type Invitation } from '~/stores/user.store';
import InviteUser from '~/admin/components/InviteUser.vue';
import type { TableColumn } from '@nuxt/ui';

const userStore = useUserStore();
const isInviteModalOpen = ref(false);
const toast = useToast();

const columns: TableColumn<Invitation>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'createdAt',
    header: 'Sent At',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  },
];

onMounted(() => {
  userStore.fetchInvitations();
});

function handleInviteSuccess() {
  isInviteModalOpen.value = false;
  userStore.fetchInvitations();
  toast.add({ title: 'Invitation sent successfully' });
}

async function handleResend(email: string) {
  try {
    await userStore.resendInvitation(email);
    toast.add({ title: 'Invitation resent successfully' });
  } catch (error) {
    console.error(error);
    // Error handled in store
  }
}

async function handleDelete(id: number) {
  if (!confirm('Are you sure you want to delete this invitation?')) return;
  try {
    await userStore.deleteInvitation(id);
    toast.add({ title: 'Invitation deleted successfully' });
  } catch (error) {
    console.error(error);
    // Error handled in store
  }
}
</script>
