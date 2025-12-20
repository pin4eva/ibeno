<script setup lang="ts">
import {
  ApplicationStatusEnum,
  GenderEnum,
  type Application,
} from '~/interfaces/application.interface';
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

const app = computed(
  () =>
    applicationStore.application || {
      applicationNo: '',
      status: '',
    },
);

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
  school: '',
  faculty: '',
  department: '',
  regNo: '',
  level: 0,
  programDuration: 0,
  bankName: '',
  accountNumber: '',
  accountName: '',
  passport: '',
  admissionLeterUrl: '',
  lastSchoolFeeReceiptUrl: '',
  certificateOfOriginUrl: '',
  ssceResultUrl: '',
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

async function submitApplication() {
  if (!confirm('Are you sure you want to submit? You cannot edit after submission.')) return;
  try {
    await applicationStore.updateApplication({
      id: applicationId,
      ...state,
      dob: state.dob ? toIsoDateTime(state.dob) : state.dob,
      status: ApplicationStatusEnum.Submitted,
    });
    toast.add({ title: 'Success', description: 'Application submitted successfully!' });
    router.push('/applications/success'); // Reuse success page or new one
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'red' });
  }
}

async function handleFileUpload(files: FileList, fieldName: keyof typeof state) {
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file) return;
  try {
    const url = await applicationStore.uploadFile(file);
    (state[fieldName] as string) = url;

    toast.add({ title: 'Uploaded', description: `${fieldName} uploaded` });
  } catch (error) {
    console.error(error);
    toast.add({ title: 'Error', description: 'Upload failed', color: 'red' });
  }
}
</script>

<template>
  <UContainer class="py-10">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Application: {{ app.applicationNo }}</h1>
        <p class="text-gray-500">Status: {{ app.status }}</p>
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="First Name"><UInput v-model="state.firstName" /></UFormField>
            <UFormField label="Last Name"><UInput v-model="state.lastName" /></UFormField>
            <UFormField label="Middle Name"><UInput v-model="state.middleName" /></UFormField>
            <UFormField label="Email"><UInput v-model="state.email" disabled /></UFormField>
            <UFormField label="Phone"><UInput v-model="state.phone" /></UFormField>
            <UFormField label="NIN"><UInput v-model="state.nin" disabled /></UFormField>
            <UFormField label="Date of Birth">
              <UInput v-model="state.dob" type="date" />
            </UFormField>
            <UFormField label="Gender">
              <USelect v-model="state.gender" :options="['Male', 'Female']" />
            </UFormField>
            <UFormField label="Village"><UInput v-model="state.village" /></UFormField>
            <UFormField label="LGA"><UInput v-model="state.lga" /></UFormField>
            <UFormField label="State"><UInput v-model="state.state" /></UFormField>
            <UFormField label="Address"><UInput v-model="state.address" /></UFormField>
            <UFormField label="Ekpuk"><UInput v-model="state.ekpuk" /></UFormField>
            <UFormField label="Country"><UInput v-model="state.country" /></UFormField>
          </div>
        </UCard>
      </template>

      <template #education>
        <UCard>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="School"><UInput v-model="state.school" /></UFormField>
            <UFormField label="Faculty"><UInput v-model="state.faculty" /></UFormField>
            <UFormField label="Department"><UInput v-model="state.department" /></UFormField>
            <UFormField label="Reg No"><UInput v-model="state.regNo" /></UFormField>
            <UFormField label="Level">
              <UInput v-model="state.level" type="number" />
            </UFormField>
            <UFormField label="Duration (Years)">
              <UInput v-model="state.programDuration" type="number" />
            </UFormField>
          </div>
        </UCard>
      </template>

      <template #bank>
        <UCard>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Bank Name"><UInput v-model="state.bankName" /></UFormField>
            <UFormField label="Account Number">
              <UInput v-model="state.accountNumber" />
            </UFormField>
            <UFormField label="Account Name"><UInput v-model="state.accountName" /></UFormField>
          </div>
        </UCard>
      </template>

      <template #documents>
        <UCard>
          <div class="space-y-6">
            <UFormField label="Passport Photo">
              <input
                type="file"
                @change="(e) => handleFileUpload((e.target as HTMLInputElement).files!, 'passport')"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p v-if="state.passport" class="text-sm text-green-500 mt-1">Uploaded</p>
            </UFormField>

            <UFormField label="Admission Letter">
              <input
                type="file"
                @change="
                  (e) =>
                    handleFileUpload((e.target as HTMLInputElement).files!, 'admissionLeterUrl')
                "
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p v-if="state.admissionLeterUrl" class="text-sm text-green-500 mt-1">Uploaded</p>
            </UFormField>

            <UFormField label="Last School Fee Receipt">
              <input
                type="file"
                @change="
                  (e) =>
                    handleFileUpload(
                      (e.target as HTMLInputElement).files!,
                      'lastSchoolFeeReceiptUrl',
                    )
                "
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p v-if="state.lastSchoolFeeReceiptUrl" class="text-sm text-green-500 mt-1">
                Uploaded
              </p>
            </UFormField>

            <UFormField label="Certificate of Origin">
              <input
                type="file"
                @change="
                  (e) =>
                    handleFileUpload(
                      (e.target as HTMLInputElement).files!,
                      'certificateOfOriginUrl',
                    )
                "
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p v-if="state.certificateOfOriginUrl" class="text-sm text-green-500 mt-1">
                Uploaded
              </p>
            </UFormField>

            <UFormField label="SSCE Result">
              <input
                type="file"
                @change="
                  (e) => handleFileUpload((e.target as HTMLInputElement).files!, 'ssceResultUrl')
                "
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p v-if="state.ssceResultUrl" class="text-sm text-green-500 mt-1">Uploaded</p>
            </UFormField>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton block size="xl" @click="submitApplication">Submit Application</UButton>
          </div>
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>
