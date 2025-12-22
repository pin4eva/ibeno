<script setup lang="ts">
import { ApplicationStatusEnum, type Application } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';

useSeoMeta({
  title: 'Application',
});

const route = useRoute();
const toast = useToast();

const programId = Number(route.params.id);
const applicationId = Number(route.params.applicationId);

if (!Number.isFinite(programId) || !Number.isFinite(applicationId)) {
  throw createError({ statusCode: 404, statusMessage: 'Application not found' });
}

const {
  data: app,
  pending,
  error,
  refresh,
} = await useAsyncData(`admin-program-${programId}-application-${applicationId}`, () =>
  apiFetch<Application>(`/applications/single/${applicationId}`),
);

type ErrorWithMessage = { message?: string };
function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

const tabs = [
  { label: 'Personal', slot: 'personal' },
  { label: 'Education', slot: 'education' },
  { label: 'Documents', slot: 'documents' },
  { label: 'Bank', slot: 'bank' },
  { label: 'Review', slot: 'review' },
];

const docs = computed(() => {
  if (!app.value) return [] as Array<{ label: string; url: string; kind: 'image' | 'link' }>;

  const items: Array<{ label: string; url: string; kind: 'image' | 'link' }> = [];
  const documents = app.value.documentUpload;

  if (app.value.passport) items.push({ label: 'Passport', url: app.value.passport, kind: 'image' });
  if (documents?.admissionLetter)
    items.push({ label: 'Admission Letter', url: documents.admissionLetter, kind: 'link' });
  if (documents?.lastSchoolFeeReceipt)
    //lastSchoolFeeReceipt
    items.push({
      label: 'Last School Fee Receipt',
      url: documents.lastSchoolFeeReceipt,
      kind: 'link',
    });
  if (documents?.certificateOfOrigin)
    items.push({
      label: 'Certificate of Origin',
      url: documents.certificateOfOrigin,
      kind: 'link',
    });
  if (documents?.ssceResult)
    items.push({ label: 'SSCE Result', url: documents.ssceResult, kind: 'link' });
  return items;
});

// Action handlers
const isActionModalOpen = ref(false);
const actionType = ref<'approve' | 'reject' | 'request-changes' | null>(null);
const actionComment = ref('');
const isSubmitting = ref(false);

const openActionModal = (action: 'approve' | 'reject' | 'request-changes') => {
  actionType.value = action;
  actionComment.value = '';
  isActionModalOpen.value = true;
};

const closeActionModal = () => {
  isActionModalOpen.value = false;
  actionType.value = null;
  actionComment.value = '';
};

const handleAction = async () => {
  if (!actionType.value || !app.value) return;

  try {
    isSubmitting.value = true;
    const statusMap = {
      approve: ApplicationStatusEnum.Accepted,
      reject: ApplicationStatusEnum.Rejected,
      'request-changes': ApplicationStatusEnum.Reviewed,
    };

    const status = statusMap[actionType.value];
    await apiFetch(`/api/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: {
        status,
        comment: actionComment.value || undefined,
      },
    });

    await refresh();
    toast.add({
      title: 'Success',
      description: `Application ${actionType.value === 'approve' ? 'approved' : actionType.value === 'reject' ? 'rejected' : 'marked for review'} successfully`,
      color: 'green',
    });
    closeActionModal();
  } catch (err) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(err, 'Failed to update application status'),
      color: 'red',
    });
  } finally {
    isSubmitting.value = false;
  }
};

const actionLabels = {
  approve: 'Approve Application',
  reject: 'Reject Application',
  'request-changes': 'Request Changes',
};

</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          Application<span v-if="app?.applicationNo">: {{ app.applicationNo }}</span>
        </h1>
        <div class="mt-2 flex items-center gap-2">
          <UButton
            icon="i-lucide-arrow-left"
            color="gray"
            variant="ghost"
            label="Back to Program"
            :to="`/admin/programs/${programId}`"
          />
          <UBadge v-if="app?.status" :color="app.status === 'Accepted' ? 'green' : app.status === 'Rejected' ? 'red' : 'yellow'" variant="subtle">
            {{ app.status }}
          </UBadge>
        </div>
      </div>
      <div v-if="app && app.status === 'Submitted'" class="flex items-center gap-2">
        <UButton
          icon="i-lucide-check"
          color="green"
          variant="solid"
          label="Approve"
          @click="openActionModal('approve')"
        />
        <UButton
          icon="i-lucide-x"
          color="red"
          variant="solid"
          label="Reject"
          @click="openActionModal('reject')"
        />
        <UButton
          icon="i-lucide-message-square"
          color="yellow"
          variant="outline"
          label="Request Changes"
          @click="openActionModal('request-changes')"
        />
      </div>
    </div>

    <UCard v-if="error">
      <template #header>
        <h3 class="font-semibold">Could not load application</h3>
      </template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ getErrorMessage(error, 'Please try again.') }}
      </p>
    </UCard>

    <div v-else-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <UCard v-else-if="app">
      <UTabs :items="tabs" class="w-full">
        <template #personal>
          <UCard>
            <template #header><h3 class="font-semibold">Personal</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">Full Name</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.firstName }} {{ app.middleName }} {{ app.lastName }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Email</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.email }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Phone</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.phone }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">NIN</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.nin }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">DOB</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.dob ? new Date(app.dob).toLocaleDateString() : '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Gender</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ app.gender }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Address</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.address || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">State / LGA</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.state || '-' }}<span v-if="app.lga"> / {{ app.lga }}</span>
                </dd>
              </div>
            </dl>
          </UCard>
        </template>

        <template #education>
          <UCard>
            <template #header><h3 class="font-semibold">Education</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">School</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.schoolRecord?.school || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Faculty</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.schoolRecord?.faculty || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Department</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.schoolRecord?.department || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Reg No</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.schoolRecord?.regNo || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Level</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.schoolRecord?.level ?? '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Program duration</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.schoolRecord?.programDuration ?? '-' }}
                </dd>
              </div>
            </dl>
          </UCard>
        </template>

        <template #documents>
          <UCard>
            <template #header><h3 class="font-semibold">Documents</h3></template>
            <div v-if="docs.length" class="space-y-4">
              <div v-for="d in docs" :key="d.label" class="space-y-2">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ d.label }}</p>
                <img v-if="d.kind === 'image'" :src="d.url" class="w-full max-w-md rounded-lg" />
                <UButton
                  v-else
                  :to="d.url"
                  target="_blank"
                  variant="link"
                  icon="i-lucide-external-link"
                >
                  View Document
                </UButton>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">No documents uploaded.</p>
          </UCard>
        </template>

        <template #bank>
          <UCard>
            <template #header><h3 class="font-semibold">Bank</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">Bank name</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.bankDetails?.bankName || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Account number</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.bankDetails?.accountNo || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Account name</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.bankDetails?.accountName || '-' }}
                </dd>
              </div>
            </dl>
          </UCard>
        </template>

        <template #review>
          <UCard>
            <template #header><h3 class="font-semibold">Review</h3></template>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm text-gray-500">Application No</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.applicationNo || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Status</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.status || '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Created</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.createdAt ? new Date(app.createdAt).toLocaleString() : '-' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Updated</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ app.updatedAt ? new Date(app.updatedAt).toLocaleString() : '-' }}
                </dd>
              </div>
            </dl>
          </UCard>
        </template>
      </UTabs>
    </UCard>

    <!-- Action Modal -->
    <UModal v-model:open="isActionModalOpen" :ui="{ content: 'w-full sm:max-w-lg' }">
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold">
              {{ actionType ? actionLabels[actionType] : '' }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Application: {{ app?.applicationNo }}
            </p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="closeActionModal" />
        </div>
      </template>

      <template #body>
        <form class="space-y-4" @submit.prevent="handleAction">
          <UFormField label="Comment" :hint="actionType === 'request-changes' ? 'Required' : 'Optional'">
            <UTextarea
              v-model="actionComment"
              :required="actionType === 'request-changes'"
              :disabled="isSubmitting"
              placeholder="Enter your comment or reason..."
              :rows="4"
            />
          </UFormField>

          <div class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              :disabled="isSubmitting"
              @click="closeActionModal"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              :color="actionType === 'approve' ? 'green' : actionType === 'reject' ? 'red' : 'yellow'"
              :loading="isSubmitting"
              :disabled="isSubmitting || (actionType === 'request-changes' && !actionComment)"
            >
              Confirm
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
