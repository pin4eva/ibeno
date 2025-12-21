<script lang="ts" setup>
import { ApplicationStatusEnum, type Application } from '~/interfaces/application.interface';
const applicationStore = useApplicationStore();

const props = defineProps<{
  applicationId: number;
  application?: Application | null;
}>();

const showAlert = ref(false);

const schoolRecord = computed(() => props.application?.schoolRecord);
const documentUpload = computed(() => props.application?.documentUpload);
const bankDetails = computed(() => props.application?.bankDetails);

const submitApplication = async () => {
  if (!props.applicationId) {
    throw new Error('Application ID is required');
  }
  try {
    await applicationStore.submitApplication(props.applicationId);
    showAlert.value = true;
  } catch (error) {
    console.error('Error submitting application:', error);
  }
};
</script>
<template>
  <UCard>
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
        v-if="showAlert"
      >
        <template #description>
          <p>
            Thank you for submitting your application. We have received your information and will
            contact you via email at <strong>{{ application?.email }}</strong> after a thorough
            review of your application.
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
            <p class="font-medium">{{ toDateInput(application?.dob) }}</p>
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
            <p class="font-medium">{{ schoolRecord?.school }}</p>
          </div>
          <div>
            <p class="text-muted">Faculty</p>
            <p class="font-medium">{{ schoolRecord?.faculty }}</p>
          </div>
          <div>
            <p class="text-muted">Department</p>
            <p class="font-medium">{{ schoolRecord?.department }}</p>
          </div>
          <div>
            <p class="text-muted">Registration Number</p>
            <p class="font-medium">{{ schoolRecord?.regNo }}</p>
          </div>
          <div>
            <p class="text-muted">Level</p>
            <p class="font-medium">{{ schoolRecord?.level }}</p>
          </div>
          <div>
            <p class="text-muted">Program Duration</p>
            <p class="font-medium">{{ schoolRecord?.programDuration }} years</p>
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
              {{ documentUpload?.admissionLetter ? 'Uploaded ✓' : 'Not Uploaded' }}
            </p>
          </div>
          <div>
            <p class="text-muted">School Fee Receipt</p>
            <p class="font-medium">
              {{ documentUpload?.lastSchoolFeeReceipt ? 'Uploaded ✓' : 'Not Uploaded' }}
            </p>
          </div>
          <div>
            <p class="text-muted">Certificate of Origin</p>
            <p class="font-medium">
              {{ documentUpload?.certificateOfOrigin ? 'Uploaded ✓' : 'Not Uploaded' }}
            </p>
          </div>
          <div>
            <p class="text-muted">SSCE Result</p>
            <p class="font-medium">
              {{ documentUpload?.ssceResult ? 'Uploaded ✓' : 'Not Uploaded' }}
            </p>
          </div>
          <!-- <div>
                <p class="text-muted">Passport Photo</p>
                <p class="font-medium">
                  {{ documentUpload?.passport ? 'Uploaded ✓' : 'Not Uploaded' }}
                </p>
              </div> -->
        </div>
      </div>

      <UDivider />

      <!-- Bank Information -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">Bank Information</h3>
        <div class="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p class="text-muted">Bank Name</p>
            <p class="font-medium">{{ bankDetails?.bankName }}</p>
          </div>
          <div>
            <p class="text-muted">Account Number</p>
            <p class="font-medium">{{ bankDetails?.accountNo }}</p>
          </div>
          <div>
            <p class="text-muted">Account Name</p>
            <p class="font-medium">{{ bankDetails?.accountName }}</p>
          </div>
        </div>
      </div>
    </div>
    <template v-if="application?.status === ApplicationStatusEnum.InProgress" #footer>
      <div class="flex justify-end">
        <UButton @click="submitApplication"> Submit Application </UButton>
      </div>
    </template>
  </UCard>
</template>
