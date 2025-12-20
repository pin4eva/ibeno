<script lang="ts" setup>
import type { Application } from '~/interfaces/application.interface';
import { useApplicationStore } from '~/stores/application.store';

type DocumentField =
  | 'passport'
  | 'admissionLeterUrl'
  | 'lastSchoolFeeReceiptUrl'
  | 'certificateOfOriginUrl'
  | 'ssceResultUrl';

const props = defineProps<{
  application?: Application | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'updated', payload: Partial<Pick<Application, DocumentField>>): void;
  (e: 'stepComplete', step: string): void;
}>();

const applicationStore = useApplicationStore();
const toast = useToast();

const state = reactive<Record<DocumentField, string>>({
  passport: props.application?.passport || '',
  admissionLeterUrl: props.application?.admissionLeterUrl || '',
  lastSchoolFeeReceiptUrl: props.application?.lastSchoolFeeReceiptUrl || '',
  certificateOfOriginUrl: props.application?.certificateOfOriginUrl || '',
  ssceResultUrl: props.application?.ssceResultUrl || '',
});

watch(
  () => props.application,
  (app) => {
    state.passport = app?.passport || '';
    state.admissionLeterUrl = app?.admissionLeterUrl || '';
    state.lastSchoolFeeReceiptUrl = app?.lastSchoolFeeReceiptUrl || '';
    state.certificateOfOriginUrl = app?.certificateOfOriginUrl || '';
    state.ssceResultUrl = app?.ssceResultUrl || '';
  },
  { immediate: true },
);

type DocItem = {
  key: DocumentField;
  label: string;
  accept?: string;
  required?: boolean;
};

const documents: DocItem[] = [
  { key: 'passport', label: 'Passport photo', accept: 'image/*', required: true },
  { key: 'admissionLeterUrl', label: 'Admission letter', accept: 'application/pdf,image/*' },
  {
    key: 'lastSchoolFeeReceiptUrl',
    label: 'Last school fee receipt',
    accept: 'application/pdf,image/*',
  },
  {
    key: 'certificateOfOriginUrl',
    label: 'Certificate of origin',
    accept: 'application/pdf,image/*',
  },
  { key: 'ssceResultUrl', label: 'SSCE result', accept: 'application/pdf,image/*' },
];

const uploading = reactive<Record<DocumentField, boolean>>({
  passport: false,
  admissionLeterUrl: false,
  lastSchoolFeeReceiptUrl: false,
  certificateOfOriginUrl: false,
  ssceResultUrl: false,
});

const selectedFileName = reactive<Record<DocumentField, string>>({
  passport: '',
  admissionLeterUrl: '',
  lastSchoolFeeReceiptUrl: '',
  certificateOfOriginUrl: '',
  ssceResultUrl: '',
});

const fileInputs = reactive<Record<DocumentField, HTMLInputElement | null>>({
  passport: null,
  admissionLeterUrl: null,
  lastSchoolFeeReceiptUrl: null,
  certificateOfOriginUrl: null,
  ssceResultUrl: null,
});

// Check if all required documents are uploaded
const allDocumentsUploaded = computed(() => {
  return documents.every((doc) => {
    if (doc.required) {
      return !!state[doc.key];
    }
    return true;
  });
});

function openPicker(field: DocumentField) {
  if (props.disabled) return;
  fileInputs[field]?.click();
}

type ErrorWithMessage = { message?: string };
function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (typeof maybe.message === 'string' && maybe.message.length) return maybe.message;
  }
  return fallback;
}

async function handleFileUpload(field: DocumentField, files: FileList | null) {
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file) return;

  selectedFileName[field] = file.name;

  uploading[field] = true;
  try {
    const url = await applicationStore.uploadFile(file);
    state[field] = url;

    const appId = props.application?.id;
    if (appId) {
      await applicationStore.updateApplication({ id: appId, [field]: url });
    }

    emit('updated', { [field]: url });
    toast.add({
      title: 'Uploaded',
      description: `${documents.find((d) => d.key === field)?.label || field} uploaded`,
    });
  } catch (error: unknown) {
    toast.add({
      title: 'Upload failed',
      description: getErrorMessage(error, 'Please try again.'),
      color: 'red',
    });
  } finally {
    uploading[field] = false;
  }
}

const handleContinue = () => {
  if (allDocumentsUploaded.value) {
    emit('stepComplete', 'documents');
  } else {
    toast.add({
      title: 'Missing documents',
      description: 'Please upload your passport photo before continuing.',
      color: 'red',
    });
  }
};
</script>
<template>
  <div class="space-y-4">
    <UAlert v-if="disabled" color="warning" variant="soft" class="mb-4">
      <template #description>
        Please complete the previous step before editing this section.
      </template>
    </UAlert>

    <UAlert v-else color="neutral" variant="soft">
      <template #description>
        Click <strong>Upload file</strong> to choose a document. Only
        <strong>Passport photo</strong> is required.
      </template>
    </UAlert>

    <UCard v-for="doc in documents" :key="doc.key" variant="soft">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="font-medium">
            {{ doc.label }}
            <span v-if="doc.required" class="text-red-500">*</span>
          </p>
          <p class="mt-1 text-sm text-muted">
            <span v-if="state[doc.key]">File uploaded.</span>
            <span v-else>No file uploaded yet.</span>
            <span v-if="selectedFileName[doc.key]"> Selected: {{ selectedFileName[doc.key] }}</span>
          </p>

          <div v-if="state[doc.key]" class="mt-2">
            <ULink :to="state[doc.key]" target="_blank" class="text-sm">View uploaded file</ULink>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UBadge v-if="state[doc.key]" color="green" variant="soft">Uploaded</UBadge>
          <UButton
            color="primary"
            variant="solid"
            :loading="uploading[doc.key]"
            :disabled="uploading[doc.key] || disabled"
            @click="openPicker(doc.key)"
          >
            {{ state[doc.key] ? 'Replace file' : 'Upload file' }}
          </UButton>
        </div>
      </div>

      <input
        :ref="(el) => (fileInputs[doc.key] = el as HTMLInputElement | null)"
        type="file"
        :accept="doc.accept"
        class="hidden"
        @change="(e) => handleFileUpload(doc.key, (e.target as HTMLInputElement).files)"
      />
    </UCard>

    <div class="flex justify-end mt-4">
      <UButton @click="handleContinue" :disabled="!allDocumentsUploaded || disabled">
        Save and Continue
      </UButton>
    </div>
  </div>
</template>
