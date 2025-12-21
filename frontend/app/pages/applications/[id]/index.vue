<script setup lang="ts">
import { GenderEnum, type Application } from '~/interfaces/application.interface';
import { toDateInput, toIsoDateTime } from '~/utils/date';

const route = useRoute();
const router = useRouter();
const applicationStore = useApplicationStore();
const toast = useToast();

const applicationId = parseInt(route.params.id as string);

onMounted(async () => {
  if (!applicationStore.application || applicationStore.application.id !== applicationId) {
    if (!applicationStore.application) {
      toast.add({ title: 'Session Expired', description: 'Please login again', color: 'yellow' });
      router.push('/applications/login');
    }
  }
});

const app = computed(() => applicationStore.application);

const items = [
  { slot: 'personal', label: 'Personal Info' },
  { slot: 'education', label: 'Education' },
  { slot: 'bank', label: 'Bank Details' },
  { slot: 'documents', label: 'Documents' },
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

async function saveProgress() {
  try {
    await applicationStore.updateApplication({
      id: applicationId,
      ...state,
      dob: state.dob ? toIsoDateTime(state.dob) : state.dob,
    });
    toast.add({ title: 'Saved', description: 'Progress saved successfully' });
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'red' });
  }
}
</script>

<template>
  <UContainer class="py-10">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Application: {{ app?.applicationNo }}</h1>
        <p class="text-gray-500">Status: {{ app?.status }}</p>
      </div>
      <div class="flex gap-2">
        <UButton @click="saveProgress" variant="ghost" icon="i-heroicons-bookmark">
          Save Progress
        </UButton>
      </div>
    </div>

    <UTabs :items="items" class="w-full">
      <template #personal>
        <UCard>
          <ApplicationsPersonalInformationForm :application="app" />
        </UCard>
      </template>

      <template #education>
        <UCard>
          <ApplicationsEducationForm
            v-if="app?.id"
            :application-id="app.id"
            :school-record="app.schoolRecord"
          />
        </UCard>
      </template>

      <template #bank>
        <UCard>
          <ApplicationsBankForm
            v-if="app?.id"
            :application-id="app.id"
            :bank-details="app.bankDetails"
          />
        </UCard>
      </template>

      <template #documents>
        <UCard>
          <ApplicationsDocumentUploads v-if="app" :application="app" @updated="saveProgress" />
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>
