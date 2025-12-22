<script lang="ts" setup>
import { useUserStore } from '~/stores/user.store';

const emit = defineEmits<{
  success: [];
}>();

const userStore = useUserStore();
const { loading, error } = storeToRefs(userStore);

const form = reactive({
  email: '',
  role: 'User',
  department: 'None',
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

async function handleInvite() {
  await userStore.inviteUser(form);
  if (!error.value) {
    emit('success');
  }
}
</script>
<template>
  <form class="space-y-4" @submit.prevent="handleInvite">
    <UFormField label="Email" name="email">
      <UInput v-model="form.email" type="email" required placeholder="user@example.com" />
    </UFormField>

    <UFormField label="Role" name="role">
      <USelect v-model="form.role" :items="roles" />
    </UFormField>

    <UFormField label="Department" name="department">
      <USelect v-model="form.department" :items="departments" />
    </UFormField>

    <div class="flex justify-end">
      <UButton
        type="submit"
        color="primary"
        variant="solid"
        label="Send Invitation"
        :loading="loading"
      />
    </div>
  </form>
  <div v-if="error" class="text-red-500 text-sm">
    {{ error }}
  </div>
</template>
