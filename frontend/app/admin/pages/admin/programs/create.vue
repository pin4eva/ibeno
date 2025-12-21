<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" to="/admin/programs" />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create Program</h2>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Name -->
          <div class="sm:col-span-2">
            <UFormGroup label="Program Name" required>
              <UInput
                v-model="formData.name"
                placeholder="e.g., Scholarship Program 2024"
                :disabled="programsStore.loading"
              />
            </UFormGroup>
          </div>

          <!-- Category -->
          <UFormGroup label="Category" required>
            <USelectMenu
              v-model="formData.category"
              :options="categoryOptions"
              placeholder="Select category"
              :disabled="programsStore.loading"
            />
          </UFormGroup>

          <!-- Sub Category -->
          <UFormGroup label="Sub Category">
            <UInput
              v-model="formData.subCategory"
              placeholder="e.g., Undergraduate, JAMB, etc."
              :disabled="programsStore.loading"
            />
          </UFormGroup>

          <!-- Start Date -->
          <UFormGroup label="Start Date">
            <UInput
              v-model="formData.startDate"
              type="date"
              :disabled="programsStore.loading"
            />
          </UFormGroup>

          <!-- End Date -->
          <UFormGroup label="End Date">
            <UInput v-model="formData.endDate" type="date" :disabled="programsStore.loading" />
          </UFormGroup>

          <!-- Is Active -->
          <div class="sm:col-span-2">
            <UFormGroup label="Status">
              <UToggle
                v-model="formData.isActive"
                :disabled="programsStore.loading"
                on-icon="i-lucide-check"
                off-icon="i-lucide-x"
              />
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {{ formData.isActive ? 'Active - Users can apply' : 'Inactive - No applications' }}
              </p>
            </UFormGroup>
          </div>

          <!-- Description -->
          <div class="sm:col-span-2">
            <UFormGroup label="Description" required>
              <UTextarea
                v-model="formData.description"
                placeholder="Describe the program, eligibility criteria, benefits, etc."
                :rows="6"
                :disabled="programsStore.loading"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton variant="ghost" color="gray" to="/admin/programs" :disabled="programsStore.loading">
            Cancel
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="programsStore.loading"
            :disabled="!isFormValid"
          >
            Create Program
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useProgramsStore } from '~/stores/programs.store';
import { ProgramCategoryEnum } from '~/interfaces/programs.interface';
import type { CreateProgramDTO } from '~/interfaces/programs.interface';

const programsStore = useProgramsStore();
const router = useRouter();
const toast = useToast();

const formData = ref<CreateProgramDTO>({
  name: '',
  description: '',
  category: ProgramCategoryEnum.Education,
  isActive: false,
  subCategory: '',
  startDate: '',
  endDate: '',
});

const categoryOptions = [
  { label: 'Education', value: ProgramCategoryEnum.Education },
  { label: 'Medical Mission', value: ProgramCategoryEnum.Medical },
  { label: 'Community Service', value: ProgramCategoryEnum.Community },
];

const isFormValid = computed(() => {
  return (
    formData.value.name.trim() !== '' &&
    formData.value.description.trim() !== '' &&
    formData.value.category !== null
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fill in all required fields',
      color: 'red',
    });
    return;
  }

  try {
    // Prepare data for submission
    const submitData: CreateProgramDTO = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      category: formData.value.category,
      isActive: formData.value.isActive,
    };

    // Add optional fields if provided
    if (formData.value.subCategory?.trim()) {
      submitData.subCategory = formData.value.subCategory.trim();
    }
    if (formData.value.startDate) {
      submitData.startDate = formData.value.startDate;
    }
    if (formData.value.endDate) {
      submitData.endDate = formData.value.endDate;
    }

    await programsStore.createProgram(submitData);
    
    toast.add({
      title: 'Success',
      description: 'Program created successfully',
      color: 'green',
    });
    
    router.push('/admin/programs');
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to create program',
      color: 'red',
    });
  }
};
</script>
