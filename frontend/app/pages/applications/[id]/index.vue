<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
import {
  ApplicationStatusEnum,
  GenderEnum,
  type Application,
} from '~/interfaces/application.interface';
import { toDateInput } from '~/utils/date';

definePageMeta({
  layout: 'applications',
});

const route = useRoute();
const router = useRouter();
const applicationStore = useApplicationStore();
const toast = useToast();

const applicationId = parseInt(route.params.id as string);

const passportInput = ref<HTMLInputElement | null>(null);
const uploadingPassport = ref(false);
const placeholderPassport = '/assets/images/placeholder.png';

onMounted(async () => {
  if (!applicationStore.application || applicationStore.application.id !== applicationId) {
    if (!applicationStore.application) {
      toast.add({ title: 'Session Expired', description: 'Please login again', color: 'yellow' });
      router.push('/applications/login');
    }
  }
});

const app = computed(() => applicationStore.application);

const items: TabsItem[] = [
  { slot: 'personal', label: 'Personal Info', value: 'personal' },
  { slot: 'education', label: 'Education', value: 'education', disabled: !app.value?.complete },
  {
    slot: 'bank',
    label: 'Bank Details',
    value: 'bank',
    disabled: !app.value?.schoolRecord?.complete,
  },
  {
    slot: 'documents',
    label: 'Documents',
    value: 'documents',
    disabled: !app.value?.bankDetails?.complete,
  },
];

const state = reactive<Partial<Application>>({
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  nin: '',
  dob: '',
  gender: GenderEnum.Male,
  village: '',
  lga: '',
  state: '',
  address: '',
  ekpuk: '',
  country: '',
  passport: '',
});

const passportPreview = computed(
  () => applicationStore.application?.passport || placeholderPassport,
);

const active = computed({
  get: () => (route.query.step as string) || 'personal',
  set: (val: string) => {
    router.push({
      query: { step: val },
    });
  },
});

watch(
  () => applicationStore.application,
  (newApp) => {
    if (newApp) {
      Object.assign(state, newApp);
      state.dob = toDateInput(newApp.dob);
    }
  },
  { immediate: true },
);

function openPassportPicker() {
  passportInput.value?.click();
}

const nextStep = (step: string) => {
  router.push({
    query: { step },
  });
};

async function handlePassportChange(files: FileList | null) {
  if (!app.value) return;
  if (!files?.length) return;
  const file = files[0];
  if (!file) return;

  const id = app.value?.id;
  if (!id) {
    toast.add({
      title: 'Session Expired',
      description: 'Please login again to upload your passport photograph.',
      color: 'yellow',
    });
    return;
  }

  uploadingPassport.value = true;
  try {
    const url = await applicationStore.uploadFile(file);
    await applicationStore.uploadPassport(id, url);
    state.passport = url;
    toast.add({
      title: 'Passport updated',
      description: 'Your passport photograph has been saved.',
    });
  } catch (error: any) {
    toast.add({
      title: 'Upload failed',
      description: error?.message || 'Please try again.',
      color: 'red',
    });
  } finally {
    uploadingPassport.value = false;
    if (passportInput.value) passportInput.value.value = '';
  }
}
</script>

<template>
  <UContainer
    class="mt-4"
    v-if="route?.query?.step === 'review' || app?.status !== ApplicationStatusEnum.InProgress"
  >
    <ApplicationsReviewApplication v-if="app?.id" :application="app" :application-id="app?.id" />
  </UContainer>
  <UContainer v-else class="py-10">
    <UCard
      class="mb-4 application-details-card p-5 bg-linear-to-r from-white via-white to-green-50 border border-gray-100 shadow-sm"
    >
      <div class="grid gap-2 sm:grid-cols-1 md:grid-cols-3">
        <div class="grid">
          <div
            class="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <img
              :src="passportPreview"
              alt="Applicant passport photograph"
              class="object-cover h-60 w-full"
            />
            <div
              class="absolute inset-x-0 bottom-0 bg-black/40 px-2 py-1 text-[11px] font-medium text-white"
            >
              Passport
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-xs text-muted max-w-xs">
                Upload a clear JPEG or PNG. A portrait or square image works best.
              </p>
              <UButton
                color="primary"
                variant="solid"
                size="sm"
                :loading="uploadingPassport"
                @click="openPassportPicker"
              >
                {{ state.passport ? 'Change passport' : 'Upload passport' }}
              </UButton>
              <UButton
                v-if="state.passport"
                color="neutral"
                variant="soft"
                size="sm"
                :to="state.passport"
                target="_blank"
              >
                View current
              </UButton>
            </div>
          </div>
          <input
            ref="passportInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="(e) => handlePassportChange((e.target as HTMLInputElement).files)"
          />
        </div>

        <div class="col-span-2">
          <div class="flex">
            <div>
              <p class="text-sm text-muted">Applicant</p>
              <h2 class="text-xl font-semibold leading-tight">
                {{ state.firstName || 'Applicant' }}
                <span v-if="state.middleName">{{ state.middleName }}</span>
                {{ state.lastName }}
              </h2>
            </div>
          </div>

          <div class="grid text-sm">
            <div>
              <p class="text-muted">NIN</p>
              <p class="font-medium">{{ state.nin || '—' }}</p>
            </div>
            <div>
              <p class="text-muted">Date of Birth</p>
              <p class="font-medium">{{ state.dob ? toDateInput(state.dob) : '—' }}</p>
            </div>
            <div>
              <p class="text-muted">Email</p>
              <p class="font-medium">{{ state.email || '—' }}</p>
            </div>
            <div>
              <p class="text-muted">Phone</p>
              <p class="font-medium">{{ state.phone || '—' }}</p>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <UTabs v-if="route?.query?.step !== 'review'" :items="items" v-model="active" class="w-full">
      <template #personal>
        <UCard>
          <ApplicationsPersonalInformationForm
            :application="app"
            @step-complete="(step) => nextStep(step)"
          />
        </UCard>
      </template>

      <template #education>
        <UCard>
          <ApplicationsEducationForm
            v-if="app?.id"
            :application-id="app.id"
            :school-record="app.schoolRecord"
            @step-complete="(step) => nextStep(step)"
          />
        </UCard>
      </template>

      <template #documents>
        <UCard>
          <ApplicationsDocumentUploads
            v-if="app"
            :application="app"
            @step-complete="(step) => nextStep(step)"
          />
        </UCard>
      </template>
      <template #bank>
        <UCard>
          <ApplicationsBankForm
            v-if="app?.id"
            :application-id="app.id"
            :bank-details="app.bankDetails"
            @step-complete="(step) => nextStep(step)"
          />
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>
