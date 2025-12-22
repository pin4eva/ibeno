<script setup lang="ts">
import { ApplicationStatusEnum, type Application } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';

useSeoMeta({
  title: 'Student Dashboard',
});

definePageMeta({
  layout: 'applications',
});

type ErrorWithMessage = { message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

// Login form state
const isLoginOpen = ref(false);
const loginForm = ref({
  applicationNo: '',
  nin: '',
});
const isLoggingIn = ref(false);
const loginError = ref<string | null>(null);

// Applications state
const applications = ref<Application[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const currentApplication = ref<Application | null>(null);

const toast = useToast();

// Login handler
const handleLogin = async () => {
  if (!loginForm.value.applicationNo || !loginForm.value.nin) {
    loginError.value = 'Please enter both Application Number and NIN';
    return;
  }

  isLoggingIn.value = true;
  loginError.value = null;

  try {
    const application = await apiFetch<Application>('/applications/login', {
      method: 'POST',
      body: {
        applicationNo: loginForm.value.applicationNo,
        nin: loginForm.value.nin,
      },
    });

    currentApplication.value = application;

    // Store in session
    if (process.client) {
      sessionStorage.setItem('studentApplication', JSON.stringify(application));
    }

    await loadApplications();
    isLoginOpen.value = false;
    toast.add({
      title: 'Success',
      description: 'Logged in successfully',
      color: 'green',
    });
  } catch (err) {
    loginError.value = getErrorMessage(err, 'Invalid Application Number or NIN');
  } finally {
    isLoggingIn.value = false;
  }
};

// Load applications
const loadApplications = async () => {
  if (!currentApplication.value?.nin) return;

  isLoading.value = true;
  loadError.value = null;

  try {
    // Fetch all applications by this student's NIN
    const allApplications = await apiFetch<Application[]>('/applications/student-history', {
      method: 'POST',
      body: { nin: currentApplication.value?.nin },
    });
    applications.value = allApplications;
  } catch (err) {
    loadError.value = getErrorMessage(err, 'Failed to load applications');
  } finally {
    isLoading.value = false;
  }
};

// Check for stored application on mount
onMounted(async () => {
  if (process.client) {
    const stored = sessionStorage.getItem('studentApplication');
    if (stored) {
      try {
        currentApplication.value = JSON.parse(stored);
        await loadApplications();
      } catch (err) {
        console.error('Failed to parse stored application', err);
      }
    }
  }
});

// Logout handler
const handleLogout = () => {
  currentApplication.value = null;
  applications.value = [];
  if (process.client) {
    sessionStorage.removeItem('studentApplication');
  }
  toast.add({
    title: 'Logged out',
    description: 'You have been logged out successfully',
    color: 'gray',
  });
};

// Status badge color
const getStatusColor = (status?: string) => {
  switch (status) {
    case ApplicationStatusEnum.Accepted:
      return 'green';
    case ApplicationStatusEnum.Rejected:
      return 'red';
    case ApplicationStatusEnum.Submitted:
      return 'blue';
    case ApplicationStatusEnum.Reviewed:
      return 'yellow';
    case ApplicationStatusEnum.InProgress:
    default:
      return 'gray';
  }
};
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Student Dashboard</h1>
          <p v-if="currentApplication" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Welcome, {{ currentApplication.firstName }} {{ currentApplication.lastName }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="!currentApplication"
            icon="i-lucide-log-in"
            color="primary"
            label="Login"
            @click="isLoginOpen = true"
          />
          <UButton
            v-else
            icon="i-lucide-log-out"
            color="gray"
            variant="ghost"
            label="Logout"
            @click="handleLogout"
          />
        </div>
      </div>

      <!-- Not logged in state -->
      <UCard v-if="!currentApplication">
        <template #header>
          <h3 class="text-lg font-semibold">Welcome to Student Dashboard</h3>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Please log in with your Application Number and NIN to view your applications.
          </p>
          <UButton icon="i-lucide-log-in" color="primary" @click="isLoginOpen = true">
            Login to Continue
          </UButton>
        </div>
      </UCard>

      <!-- Loading state -->
      <div v-else-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
      </div>

      <!-- Error state -->
      <UCard v-else-if="loadError">
        <template #header>
          <h3 class="font-semibold">Error Loading Applications</h3>
        </template>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ loadError }}</p>
      </UCard>

      <!-- Applications list -->
      <UCard v-else>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">My Applications</h3>
            <UBadge variant="subtle">{{ applications.length }}</UBadge>
          </div>
        </template>

        <div v-if="applications.length === 0" class="py-8 text-center">
          <UIcon name="i-lucide-file-text" class="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p class="text-sm text-gray-500 dark:text-gray-400">No applications found.</p>
        </div>

        <div v-else class="space-y-4">
          <UCard
            v-for="app in applications"
            :key="app.id"
            class="hover:border-primary-500 transition-colors"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex-1 space-y-2">
                <div class="flex items-start gap-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">
                      Application #{{ app.applicationNo }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Program ID: {{ app.programId }}
                    </p>
                  </div>
                  <UBadge :color="getStatusColor(app.status)" variant="subtle">
                    {{ app.status || 'In Progress' }}
                  </UBadge>
                </div>

                <div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Email:</span>
                    <span class="ml-1 font-medium">{{ app.email }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Phone:</span>
                    <span class="ml-1 font-medium">{{ app.phone }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400">Submitted:</span>
                    <span class="ml-1 font-medium">
                      {{ app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-' }}
                    </span>
                  </div>
                  <div v-if="app.updatedAt">
                    <span class="text-gray-500 dark:text-gray-400">Last Updated:</span>
                    <span class="ml-1 font-medium">
                      {{ new Date(app.updatedAt).toLocaleDateString() }}
                    </span>
                  </div>
                </div>

                <div v-if="app.comment" class="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Reviewer Comment:</p>
                  <p class="text-sm">{{ app.comment }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  :to="`/programs/${app.programId}/applications/${app.id}`"
                  color="primary"
                  size="sm"
                  icon="i-lucide-eye"
                >
                  View
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
    </div>

    <!-- Login Modal -->
    <UModal v-model:open="isLoginOpen" :ui="{ content: 'w-full sm:max-w-md' }">
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold">Student Login</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter your Application Number and NIN
            </p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="isLoginOpen = false" />
        </div>
      </template>

      <template #body>
        <form class="space-y-4" @submit.prevent="handleLogin">
          <UFormField label="Application Number" required>
            <UInput
              v-model="loginForm.applicationNo"
              :disabled="isLoggingIn"
              placeholder="e.g., APP-1-2024-001"
              required
            />
          </UFormField>

          <UFormField label="NIN" required>
            <UInput
              v-model="loginForm.nin"
              :disabled="isLoggingIn"
              placeholder="Enter your 11-digit NIN"
              required
            />
          </UFormField>

          <UAlert v-if="loginError" color="red" variant="soft" :title="loginError" />

          <div
            class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700"
          >
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              :disabled="isLoggingIn"
              @click="isLoginOpen = false"
            >
              Cancel
            </UButton>
            <UButton type="submit" color="primary" :loading="isLoggingIn" :disabled="isLoggingIn">
              Login
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </UContainer>
</template>
