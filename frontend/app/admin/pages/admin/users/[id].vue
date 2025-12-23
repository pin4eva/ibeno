<template>
  <div v-if="user" class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" to="/admin/users" />
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ user.firstName }} {{ user.lastName }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton
          v-if="!isEditing"
          icon="i-lucide-edit"
          color="primary"
          variant="solid"
          @click="enterEdit"
        >
          Edit
        </UButton>

        <div v-else class="flex gap-2">
          <UButton color="primary" variant="solid" :loading="loading" @click="handleSave"
            >Save</UButton
          >
          <UButton variant="ghost" color="gray" @click="handleCancel">Cancel</UButton>
        </div>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Profile Information</h3>
        </div>
      </template>

      <!-- Read-only view -->
      <div v-if="!isEditing" class="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
        <div>
          <p class="text-xs text-muted">First name</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ user.firstName }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Last name</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ user.lastName }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Email</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ user.email }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Phone</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ user.phone || '—' }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Role</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ user.role }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Department</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ user.department || '—' }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Status</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ user.status }}</p>
        </div>
      </div>

      <!-- Edit form -->
      <form v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2" @submit.prevent="handleSave">
        <UFormField label="First Name" name="firstName">
          <UInput v-model="form.firstName" />
        </UFormField>

        <UFormField label="Last Name" name="lastName">
          <UInput v-model="form.lastName" />
        </UFormField>

        <UFormField label="Phone" name="phone">
          <UInput v-model="form.phone" />
        </UFormField>

        <UFormField label="Role" name="role">
          <USelect v-model="form.role" :items="roles" />
        </UFormField>

        <UFormField label="Department" name="department">
          <USelect v-model="form.department" :items="departments" />
        </UFormField>

        <UFormField label="Status" name="status">
          <USelect v-model="form.status" :items="statuses" />
        </UFormField>
      </form>
    </UCard>

    <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import type { FetchError } from '~/interfaces/app.interface';
import { useUserStore } from '~/stores/user.store';

const route = useRoute();
const userStore = useUserStore();
const { loading, error } = storeToRefs(userStore);

const userId = Number(route.params.id);
const user = ref<any>(null);
const isEditing = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  role: '',
  department: '',
  status: '',
});

const roles = ['User', 'Admin', 'Editor', 'Developer', 'Student', 'Contractor'];
const departments = [
  'None',
  'HR',
  'IT',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'Legal',
  'Admin',
];
const statuses = ['Active', 'Inactive', 'Suspended', 'Blocked'];

onMounted(async () => {
  if (userId) {
    user.value = await userStore.fetchUser(userId);
    Object.assign(form, {
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      phone: user.value.phone || '',
      role: user.value.role,
      department: user.value.department,
      status: user.value.status,
    });
  }
});

function enterEdit() {
  // ensure form has latest values
  if (user.value) {
    Object.assign(form, {
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      phone: user.value.phone || '',
      role: user.value.role,
      department: user.value.department,
      status: user.value.status,
    });
  }
  isEditing.value = true;
}

function handleCancel() {
  if (!user.value) return;
  Object.assign(form, {
    firstName: user.value.firstName,
    lastName: user.value.lastName,
    phone: user.value.phone || '',
    role: user.value.role,
    department: user.value.department,
    status: user.value.status,
  });
  isEditing.value = false;
}

async function handleSave() {
  try {
    const updated = await userStore.updateUser(userId, form);
    user.value = updated;
    isEditing.value = false;
    const toast = useToast();
    toast.add({ title: 'User updated', duration: 3000, color: 'success' });
  } catch (e) {
    const err = e as FetchError;
    const toast = useToast();
    toast.add({
      title: 'Update failed',
      description: err?.data?.message || 'An error occurred while updating the user.',
      color: 'error',
    });
  }
}
</script>
