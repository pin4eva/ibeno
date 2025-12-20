<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
import type { Application } from '~/interfaces/application.interface';
import { ApplicationStatusEnum } from '~/interfaces/application.interface';
import type { Program } from '~/interfaces/programs.interface';
import { useApplicationStore } from '~/stores/application.store';
import { apiFetch } from '~/utils/api-fetch';

useSeoMeta({
  title: 'Application',
});

type ErrorWithMessage = { message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

const route = useRoute();
const router = useRouter();
const programId = computed(() => Number(route.params.id));
const applicationId = computed(() => Number(route.params.applicationId));

if (!Number.isFinite(programId.value) || !Number.isFinite(applicationId.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Application not found' });
}

const applicationStore = useApplicationStore();

const {
  data,
  status: loadStatus,
  error: loadError,
  refresh,
} = await useAsyncData(async () => {
  try {
    const [program, application] = await Promise.all([
      apiFetch<Program>(`/programs/single/${programId.value}`),
      apiFetch<Application>(`/applications/single/${applicationId.value}`),
    ]);
    if (application?.id) {
      applicationStore.setApplication(application);
    }
    return {
      program,
      application,
    };
  } catch (error) {
    console.error(error);
    return {
      program: null,
      application: null,
    };
  }
});

const program = computed(() => data.value?.program || null);
const application = computed(() => data.value?.application || null);

const state = reactive<Application>({
  programId: programId.value,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  nin: '',
  dob: '',
  gender: '',
  village: '',
  lga: '',
  state: '',
  address: '',
  ekpuk: '',
  country: '',
  school: '',
  faculty: '',
  department: '',
  regNo: '',
  level: undefined,
  programDuration: undefined,
  admissionLeterUrl: '',
  lastSchoolFeeReceiptUrl: '',
  certificateOfOriginUrl: '',
  ssceResultUrl: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  passport: '',
});

watchEffect(() => {
  if (!application.value) return;
  Object.assign(state, application.value);
  state.programId = programId.value;
});

// Track completed steps
const completedSteps = ref<Set<string>>(new Set());

// Check if application is submitted and should be readonly
const isSubmitted = computed(() => application.value?.status === ApplicationStatusEnum.Submitted);
const showReview = ref(false);

// Validate step completion
const isStepComplete = (step: string): boolean => {
  if (!application.value) return false;

  switch (step) {
    case 'personal':
      return !!(
        application.value.firstName &&
        application.value.lastName &&
        application.value.email &&
        application.value.phone &&
        application.value.nin &&
        application.value.dob &&
        application.value.gender &&
        application.value.state &&
        application.value.lga &&
        application.value.address
      );
    case 'education':
      return !!(
        application.value.school &&
        application.value.faculty &&
        application.value.department &&
        application.value.regNo &&
        application.value.level &&
        application.value.programDuration
      );
    case 'documents':
      // Only passport is required in documents step
      return !!application.value.passport;
    case 'bank':
      return !!(
        application.value.bankName &&
        application.value.accountNumber &&
        application.value.accountName
      );
    default:
      return false;
  }
};

// Update completed steps when application changes
watchEffect(() => {
  if (application.value) {
    const steps = ['personal', 'education', 'documents', 'bank'];
    steps.forEach((step) => {
      if (isStepComplete(step)) {
        completedSteps.value.add(step);
      }
    });
  }
});

const tabs: TabsItem[] = [
  { label: 'Personal', slot: 'personal', value: 'personal' },
  { label: 'Education', slot: 'education', value: 'education' },
  { label: 'Documents', slot: 'documents', value: 'documents' },
  { label: 'Bank', slot: 'bank', value: 'bank' },
] satisfies TabsItem[];

const tabItems = computed(() => {
  const currentTab = route.query.tab ? (route.query.tab as string) : 'personal';
  return tabs.map((tab) => ({
    ...tab,
    disabled: tab.value !== currentTab && !completedSteps.value.has(tab.value as string),
  }));
});

const active = computed({
  get() {
    if (showReview.value) return 'review';
    return route.query.tab ? (route.query.tab as string) : 'personal';
  },
  set(tab) {
    if (isSubmitted.value) return; // Prevent navigation when submitted

    const currentTab = route.query.tab ? (route.query.tab as string) : 'personal';

    // Users can only click into tabs they've already completed.
    // Moving forward happens via the step "Save" buttons.
    if (tab !== currentTab && !completedSteps.value.has(tab as string)) {
      return;
    }

    // Allow navigation to completed tabs or current tab
    const tabIndex = tabs.findIndex((t) => t.value === tab);
    if (tabIndex > 0) {
      const previousTab = tabs?.[tabIndex - 1]?.value;
      if (!completedSteps.value.has(previousTab as string)) {
        return; // Cannot navigate if previous step is not complete
      }
    }

    router.push({
      query: { tab },
    });
  },
});

// Handle step completion
const handleStepComplete = async (step: string) => {
  completedSteps.value.add(step);
  await refresh();

  // Move to next tab
  const currentIndex = tabs.findIndex((t) => t.value === step);
  if (currentIndex < tabs.length - 1) {
    const nextTab = tabs?.[currentIndex + 1]?.value;
    router.push({ query: { tab: nextTab } });
  }
};

// Handle final submission
const handleFinalSubmit = async () => {
  showReview.value = true;
  await refresh();

  router.replace({ query: {} });
};
</script>

<template>
  <UContainer class="py-8">
    <UCard v-if="loadError">
      <template #header>
        <h1 class="text-2xl font-semibold">Application</h1>
      </template>
      <p class="text-sm text-muted">
        {{ getErrorMessage(loadError, 'Failed to load application.') }}
      </p>
    </UCard>

    <UCard v-else-if="loadStatus === 'pending'">
      <p class="text-sm text-muted">Loading…</p>
    </UCard>

    <div v-else class="space-y-6">
      <!-- Review Page -->
      <UCard v-if="showReview || isSubmitted">
        <template #header>
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">Application Review</h1>
            <p class="text-sm text-muted">
              Application ID: {{ applicationId }}
              <span v-if="application?.applicationNo"> • {{ application.applicationNo }}</span>
            </p>
          </div>
        </template>

        <div class="space-y-6">
          <UAlert
            color="success"
            variant="soft"
            title="Application Submitted Successfully!"
            icon="i-lucide-check-circle"
          >
            <template #description>
              <p>
                Thank you for submitting your application. We have received your information and
                will contact you via email at <strong>{{ application?.email }}</strong> after a
                thorough review of your application.
              </p>
            </template>
          </UAlert>

          <!-- Personal Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold">Personal Information</h3>
            <div class="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p class="text-muted">Full Name</p>
                <p class="font-medium">
                  {{ application?.firstName }} {{ application?.middleName }}
                  {{ application?.lastName }}
                </p>
              </div>
              <div>
                <p class="text-muted">Email</p>
                <p class="font-medium">{{ application?.email }}</p>
              </div>
              <div>
                <p class="text-muted">Phone</p>
                <p class="font-medium">{{ application?.phone }}</p>
              </div>
              <div>
                <p class="text-muted">NIN</p>
                <p class="font-medium">{{ application?.nin }}</p>
              </div>
              <div>
                <p class="text-muted">Date of Birth</p>
                <p class="font-medium">{{ application?.dob }}</p>
              </div>
              <div>
                <p class="text-muted">Gender</p>
                <p class="font-medium">{{ application?.gender }}</p>
              </div>
              <div>
                <p class="text-muted">State</p>
                <p class="font-medium">{{ application?.state }}</p>
              </div>
              <div>
                <p class="text-muted">LGA</p>
                <p class="font-medium">{{ application?.lga }}</p>
              </div>
              <div class="sm:col-span-2">
                <p class="text-muted">Address</p>
                <p class="font-medium">{{ application?.address }}</p>
              </div>
            </div>
          </div>

          <UDivider />

          <!-- Education Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold">Education Information</h3>
            <div class="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p class="text-muted">School</p>
                <p class="font-medium">{{ application?.school }}</p>
              </div>
              <div>
                <p class="text-muted">Faculty</p>
                <p class="font-medium">{{ application?.faculty }}</p>
              </div>
              <div>
                <p class="text-muted">Department</p>
                <p class="font-medium">{{ application?.department }}</p>
              </div>
              <div>
                <p class="text-muted">Registration Number</p>
                <p class="font-medium">{{ application?.regNo }}</p>
              </div>
              <div>
                <p class="text-muted">Level</p>
                <p class="font-medium">{{ application?.level }}</p>
              </div>
              <div>
                <p class="text-muted">Program Duration</p>
                <p class="font-medium">{{ application?.programDuration }} years</p>
              </div>
            </div>
          </div>

          <UDivider />

          <!-- Document Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold">Documents</h3>
            <div class="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p class="text-muted">Admission Letter</p>
                <p class="font-medium">
                  {{ application?.admissionLeterUrl ? 'Uploaded ✓' : 'Not Uploaded' }}
                </p>
              </div>
              <div>
                <p class="text-muted">School Fee Receipt</p>
                <p class="font-medium">
                  {{ application?.lastSchoolFeeReceiptUrl ? 'Uploaded ✓' : 'Not Uploaded' }}
                </p>
              </div>
              <div>
                <p class="text-muted">Certificate of Origin</p>
                <p class="font-medium">
                  {{ application?.certificateOfOriginUrl ? 'Uploaded ✓' : 'Not Uploaded' }}
                </p>
              </div>
              <div>
                <p class="text-muted">SSCE Result</p>
                <p class="font-medium">
                  {{ application?.ssceResultUrl ? 'Uploaded ✓' : 'Not Uploaded' }}
                </p>
              </div>
              <div>
                <p class="text-muted">Passport Photo</p>
                <p class="font-medium">
                  {{ application?.passport ? 'Uploaded ✓' : 'Not Uploaded' }}
                </p>
              </div>
            </div>
          </div>

          <UDivider />

          <!-- Bank Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold">Bank Information</h3>
            <div class="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p class="text-muted">Bank Name</p>
                <p class="font-medium">{{ application?.bankName }}</p>
              </div>
              <div>
                <p class="text-muted">Account Number</p>
                <p class="font-medium">{{ application?.accountNumber }}</p>
              </div>
              <div>
                <p class="text-muted">Account Name</p>
                <p class="font-medium">{{ application?.accountName }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Application Form Tabs -->
      <UCard v-else>
        <template #header>
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">{{ program?.name || 'Application' }}</h1>
            <p class="text-sm text-muted">
              Application ID: {{ applicationId }}
              <span v-if="application?.applicationNo"> • {{ application.applicationNo }}</span>
            </p>
          </div>
        </template>

        <div>
          <UTabs :items="tabItems" v-model="active" class="w-full">
            <template #personal>
              <ApplicationsPersonalInformationForm
                :application="application"
                @step-complete="handleStepComplete('personal')"
              />
            </template>

            <template #education>
              <ApplicationsEducationForm
                :application="application"
                :disabled="!completedSteps.has('personal')"
                @step-complete="handleStepComplete('education')"
              />
            </template>

            <template #documents>
              <ApplicationsDocumentUploads
                :application="application"
                :disabled="!completedSteps.has('education')"
                @updated="(patch) => Object.assign(state, patch)"
                @step-complete="handleStepComplete('documents')"
              />
            </template>
            <template #bank>
              <ApplicationsBankForm
                :application="application"
                :disabled="!completedSteps.has('documents')"
                @step-complete="handleFinalSubmit"
              />
            </template>
          </UTabs>

          <UCard v-if="applicationStore.error" variant="soft">
            <p class="text-sm text-muted">{{ applicationStore.error }}</p>
          </UCard>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
