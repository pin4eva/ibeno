<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      </div>

      <!-- Profile Information Card -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h2>
        </template>

        <form class="space-y-4" @submit.prevent="handleUpdateProfile">
          <div class="flex justify-center mb-6">
            <div class="relative">
              <UAvatar
                :alt="currentUser?.firstName || 'User'"
                :src="profileForm.avatar"
                size="3xl"
              />
              <UButton
                icon="i-lucide-camera"
                color="primary"
                variant="solid"
                size="xs"
                class="absolute bottom-0 right-0 rounded-full"
                @click="handleAvatarClick"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="First Name" name="firstName">
              <UInput
                v-model="profileForm.firstName"
                placeholder="First Name"
                required
              />
            </UFormField>

            <UFormField label="Last Name" name="lastName">
              <UInput
                v-model="profileForm.lastName"
                placeholder="Last Name"
                required
              />
            </UFormField>
          </div>

          <UFormField label="Phone" name="phone">
            <UInput
              v-model="profileForm.phone"
              type="tel"
              placeholder="+234 123 456 7890"
            />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput
              :model-value="currentUser?.email"
              type="email"
              disabled
              class="bg-gray-50 dark:bg-gray-800"
            />
          </UFormField>

          <div v-if="profileError" class="text-red-500 text-sm">
            {{ profileError }}
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              color="primary"
              variant="solid"
              label="Update Profile"
              :loading="profileLoading"
            />
          </div>
        </form>
      </UCard>

      <!-- Change Password Card -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Change Password
          </h2>
        </template>

        <form class="space-y-4" @submit.prevent="handleChangePassword">
          <UFormField label="Current Password" name="oldPassword">
            <UInput
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="Enter current password"
              required
            />
          </UFormField>

          <UFormField label="New Password" name="newPassword">
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
              required
              min-length="6"
            />
          </UFormField>

          <UFormField label="Confirm New Password" name="confirmPassword">
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
            />
          </UFormField>

          <div v-if="passwordError" class="text-red-500 text-sm">
            {{ passwordError }}
          </div>

          <div v-if="passwordSuccess" class="text-green-500 text-sm">
            {{ passwordSuccess }}
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              color="primary"
              variant="solid"
              label="Change Password"
              :loading="passwordLoading"
            />
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user.store';

definePageMeta({
  middleware: 'auth',
});

const userStore = useUserStore();
const { user: currentUser } = useAuth();

const profileForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  avatar: '',
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const profileLoading = ref(false);
const profileError = ref<string | null>(null);

const passwordLoading = ref(false);
const passwordError = ref<string | null>(null);
const passwordSuccess = ref<string | null>(null);

// Initialize profile form with current user data
watchEffect(() => {
  if (currentUser.value) {
    profileForm.firstName = currentUser.value.firstName || '';
    profileForm.lastName = currentUser.value.lastName || '';
    profileForm.phone = currentUser.value.phone || '';
    profileForm.avatar = currentUser.value.avatar || '';
  }
});

async function handleUpdateProfile() {
  try {
    profileLoading.value = true;
    profileError.value = null;

    const updateData = {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone,
      avatar: profileForm.avatar,
    };

    await userStore.updateProfile(updateData);

    // Refresh current user data
    const { setUser } = useAuth();
    await setUser();

    // Show success notification (if using Nuxt UI toast)
    useToast().add({
      title: 'Success',
      description: 'Profile updated successfully',
      color: 'green',
    });
  } catch (error: any) {
    profileError.value = error?.data?.message || 'Failed to update profile';
  } finally {
    profileLoading.value = false;
  }
}

async function handleChangePassword() {
  try {
    passwordLoading.value = true;
    passwordError.value = null;
    passwordSuccess.value = null;

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordError.value = 'New passwords do not match';
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      passwordError.value = 'New password must be at least 6 characters';
      return;
    }

    await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });

    passwordSuccess.value = 'Password changed successfully';

    // Clear form
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    // Show success notification
    useToast().add({
      title: 'Success',
      description: 'Password changed successfully',
      color: 'green',
    });
  } catch (error: any) {
    passwordError.value = error?.data?.message || 'Failed to change password';
  } finally {
    passwordLoading.value = false;
  }
}

function handleAvatarClick() {
  // TODO: Implement avatar upload
  // This could open a file picker or use a third-party service like Cloudinary
  console.log('Avatar upload not implemented yet');
  useToast().add({
    title: 'Coming Soon',
    description: 'Avatar upload will be implemented soon',
    color: 'blue',
  });
}
</script>
