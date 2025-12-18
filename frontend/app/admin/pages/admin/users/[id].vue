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
          color="red"
          variant="ghost"
          label="Delete"
          :loading="loading"
          @click="handleDelete"
        />
        <UButton
          color="primary"
          variant="solid"
          label="Save Changes"
          :loading="loading"
          @click="handleSave"
        />
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Profile Information</h3>
        </div>
      </template>

      <form class="grid grid-cols-1 gap-6 sm:grid-cols-2" @submit.prevent="handleSave">
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

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
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

async function handleSave() {
  try {
    const updated = await userStore.updateUser(userId, form);
    user.value = updated;
    // Optional: Show success toast
  } catch (e) {
    const error = e as FetchError;
    console.log(error?.data?.message || 'An error occurred while updating the user.');

    // Error handled in store but we can show toast here
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this user?')) return;
  await userStore.deleteUser(userId);
  navigateTo('/admin/users');
}
</script>
