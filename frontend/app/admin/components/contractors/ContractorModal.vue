<template>
  <UModal v-model:open="internalOpen" @close="handleClose" fullscreen>
    <template #header>
      <div class="flex w-full items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-500">{{ isEditing ? 'Update' : 'Create' }} contractor</p>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Edit contractor' : 'New contractor' }}
          </h3>
        </div>
        <button>
          <UIcon
            name="i-lucide-x"
            class="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="handleClose"
          />
        </button>
      </div>
    </template>

    <template #body>
      <UForm :state="form" class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Contractor No (optional)">
            <UInput
              v-model="form.contractorNo"
              :disabled="isEditing"
              placeholder="Auto-assigned if left empty"
            />
          </UFormField>
          <UFormField label="Company Name" required>
            <UInput v-model="form.companyName" />
          </UFormField>
          <UFormField label="Status" required>
            <USelectMenu
              v-model="form.status"
              :items="statusItems"
              value-key="value"
              placeholder="Select status"
            />
          </UFormField>
          <UFormField label="Registration Category">
            <UInput v-model="form.registrationCategory" />
          </UFormField>
          <UFormField label="Major Area">
            <UInput v-model="form.majorArea" />
          </UFormField>
          <UFormField label="Sub Area">
            <UInput v-model="form.subArea" />
          </UFormField>
          <UFormField label="State of Origin">
            <UInput v-model="form.stateOfOrigin" />
          </UFormField>
          <UFormField label="Community">
            <UInput v-model="form.community" />
          </UFormField>
          <UFormField label="Contact Person">
            <UInput v-model="form.contactPerson" />
          </UFormField>
          <UFormField label="Phone">
            <UInput v-model="form.phone" />
          </UFormField>
          <UFormField label="Email">
            <UInput v-model="form.email" type="email" />
          </UFormField>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" :rows="3" />
          </UFormField>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton variant="ghost" color="gray" @click="handleClose" :disabled="saving">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="saving">
            {{ isEditing ? 'Update' : 'Create' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type {
  Contractor,
  CreateContractorInput,
  UpdateContractorInput,
} from '~/interfaces/procurement/contractor.interface';
import { useContractorStore } from '~/stores/procurement/contractor.store';

const props = defineProps<{ open: boolean; contractor?: Contractor | null }>();
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'saved', contractor: Contractor): void;
}>();

const contractorStore = useContractorStore();
const toast = useToast();

const internalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

const saving = ref(false);
const form = reactive<CreateContractorInput>({
  contractorNo: '',
  companyName: '',
  status: 'ACTIVE',
  registrationCategory: '',
  majorArea: '',
  subArea: '',
  stateOfOrigin: '',
  community: '',
  contactPerson: '',
  phone: '',
  email: '',
  notes: '',
});

const isEditing = computed(() => Boolean(props.contractor));

const statusItems = computed(() => {
  const base = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  const merged = new Set<string>(base);
  contractorStore.contractors.forEach((c) => merged.add(c.status));
  return Array.from(merged).map((s) => ({ label: s, value: s }));
});

const resetForm = () => {
  Object.assign(form, {
    contractorNo: '',
    companyName: '',
    status: 'ACTIVE',
    registrationCategory: '',
    majorArea: '',
    subArea: '',
    stateOfOrigin: '',
    community: '',
    contactPerson: '',
    phone: '',
    email: '',
    notes: '',
  });
};

watch(
  () => props.contractor,
  (contractor) => {
    if (contractor) {
      Object.assign(form, {
        contractorNo: contractor.contractorNo,
        companyName: contractor.companyName,
        status: contractor.status,
        registrationCategory: contractor.registrationCategory || '',
        majorArea: contractor.majorArea || '',
        subArea: contractor.subArea || '',
        stateOfOrigin: contractor.stateOfOrigin || '',
        community: contractor.community || '',
        contactPerson: contractor.contactPerson || '',
        phone: contractor.phone || '',
        email: contractor.email || '',
        notes: contractor.notes || '',
      });
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

const handleClose = () => {
  emit('update:open', false);
};

const handleSubmit = async () => {
  if (!form.companyName || !form.status) {
    toast.add({
      title: 'Required',
      description: 'Company and Status are required.',
      color: 'yellow',
    });
    return;
  }

  saving.value = true;
  try {
    const payload: Partial<CreateContractorInput> = { ...form };
    if (!payload.contractorNo?.trim()) {
      delete payload.contractorNo;
    }

    if (isEditing.value && props.contractor) {
      const updatePayload: UpdateContractorInput = { ...payload, id: props.contractor.id };
      const updated = await contractorStore.updateContractor(updatePayload);
      emit('saved', updated);
      toast.add({
        title: 'Updated',
        description: 'Contractor updated successfully',
        color: 'green',
      });
    } else {
      const created = await contractorStore.createContractor(payload as CreateContractorInput);
      emit('saved', created);
      toast.add({
        title: 'Created',
        description: 'Contractor created successfully',
        color: 'green',
      });
      resetForm();
    }
    emit('update:open', false);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save contractor';
    toast.add({ title: 'Error', description: message, color: 'red' });
  } finally {
    saving.value = false;
  }
};
</script>
