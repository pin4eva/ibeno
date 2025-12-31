<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Users</h2>
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-mail"
          color="primary"
          variant="outline"
          label="Invite User"
          @click="isInviteModalOpen = true"
        />
        <UButton
          icon="i-lucide-user-plus"
          color="primary"
          variant="solid"
          label="Add User"
          to="/admin/users/create"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ userStore.total }}
            </p>
          </div>
          <UIcon name="i-lucide-users" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ userStore.activeCount }}
            </p>
          </div>
          <UIcon name="i-lucide-user-check" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Users</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ userStore.inactiveCount }}
            </p>
          </div>
          <UIcon name="i-lucide-user-x" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invitations</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ userStore.invitations.length }}
            </p>
          </div>
          <UIcon name="i-lucide-mail" class="w-8 h-8 text-primary-500 opacity-80" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search users..."
            class="w-64"
          />
          <UButton
            v-if="selectedIds.size"
            icon="i-lucide-trash"
            color="error"
            variant="ghost"
            :label="'Delete ' + selectedIds.size + ' users'"
            :disabled="selectedIds.size === 0"
            @click="isDeleteModalOpen = true"
          />
        </div>
      </template>

      <UTable
        :data="userStore.users"
        :columns="columns"
        :loading="userStore.loading"
        @select="onSelect"
      />

      <!-- Pagination -->
      <template #footer>
        <div class="flex justify-end">
          <UPagination v-model:page="page" :total="userStore.total" :items-per-page="limit" />
        </div>
      </template>
    </UCard>
    <UModal v-model:open="isDeleteModalOpen" title="Delete users">
      <template #header>
        <h3 class="text-lg font-semibold">Delete selected users</h3>
      </template>
      <template #body>
        <p>
          Are you sure you want to delete {{ selectedIds.size }} selected user(s)? This will suspend
          their accounts.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="isDeleteModalOpen = false">Cancel</UButton>
          <UButton
            color="error"
            variant="solid"
            :loading="userStore.loading"
            @click="
              async () => {
                await userStore.bulkDeleteUsers(Array.from(selectedIds));
                selectedIds.clear();
                isDeleteModalOpen = false;
                await fetchUsers();
                await userStore.fetchCounts();
              }
            "
            >Delete</UButton
          >
        </div>
      </template>
    </UModal>

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
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { useUserStore, type User } from '~/stores/user.store';
import { useDebounceFn } from '@vueuse/core';
import InviteUser from '~/admin/components/InviteUser.vue';

const userStore = useUserStore();
const page = ref(1);
const limit = ref(10);
const search = ref('');
const isInviteModalOpen = ref(false);

const UAvatar = resolveComponent('UAvatar');
const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const NuxtLink = resolveComponent('NuxtLink');
const selectedIds = ref<Set<number>>(new Set());
const isDeleteModalOpen = ref(false);

const toggleSelection = (id: number, checked?: boolean) => {
  if (checked === undefined) {
    if (selectedIds.value.has(id)) selectedIds.value.delete(id);
    else selectedIds.value.add(id);
  } else {
    if (checked) selectedIds.value.add(id);
    else selectedIds.value.delete(id);
  }
};

const selectAll = (checked: boolean) => {
  if (checked) {
    userStore.users.forEach((u) => selectedIds.value.add(u.id));
  } else {
    selectedIds.value.clear();
  }
};

const baseColumns: TableColumn<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UAvatar, { alt: row.original.firstName, size: 'xs' }),
        h(
          NuxtLink,
          {
            class: 'font-medium text-gray-900 dark:text-white',
            href: `/admin/users/${row.original.id}`,
          },
          `${row.original.firstName} ${row.original.lastName}`,
        ),
      ]);
    },
  },
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
    cell: ({ row }) => {
      return h(
        UBadge,
        {
          color: row.original.status === 'Active' ? 'success' : 'error',
          variant: 'subtle',
          size: 'xs',
        },
        () => row.original.status,
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(UButton, {
        icon: 'i-lucide-edit',
        size: 'xs',
        color: 'gray',
        variant: 'ghost',
        to: `/admin/users/${row.original.id}`,
        onClick: (e: Event) => e.stopPropagation(),
      });
    },
  },
];

const columns = computed(() => {
  // selection column
  const selectCol: TableColumn<User> = {
    id: 'select',
    header: () => {
      const allSelected =
        userStore.users.length > 0 && userStore.users.every((u) => selectedIds.value.has(u.id));
      return h('input', {
        type: 'checkbox',
        checked: allSelected,
        onChange: (e: Event) => selectAll((e.target as HTMLInputElement).checked),
        class: 'form-checkbox h-4 w-4',
      });
    },
    cell: ({ row }) => {
      const id = row.original.id;
      return h('input', {
        type: 'checkbox',
        checked: selectedIds.value.has(id),
        onClick: (e: Event) => e.stopPropagation(),
        onChange: (e: Event) => toggleSelection(id, (e.target as HTMLInputElement).checked),
        class: 'form-checkbox h-4 w-4',
      });
    },
    meta: { class: { td: 'w-6' } },
  };

  return [selectCol, ...baseColumns];
});

const fetchUsers = async () => {
  await userStore.fetchUsers({
    page: page.value,
    limit: limit.value,
    search: search.value,
  });
};

// Debounce search
const debouncedSearch = useDebounceFn(() => {
  page.value = 1; // Reset to page 1 on search
  fetchUsers();
}, 500);

watch(search, debouncedSearch);
watch(page, fetchUsers);

onMounted(() => {
  fetchUsers();
  userStore.fetchCounts();
});

function onSelect(event: Event, row: TableRow<User>) {
  const user = row.original;
  navigateTo(`/admin/users/${user.id}`);
}

function handleInviteSuccess() {
  isInviteModalOpen.value = false;
  // Optionally refresh the user list
  fetchUsers();
}
</script>
