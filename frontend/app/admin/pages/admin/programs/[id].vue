<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" to="/admin/programs" />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Edit Program</h2>
    </div>

    <div v-if="programsStore.loading && !formData.id" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    <UCard v-else-if="formData.id">
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
            Update Program
          </UButton>
        </div>
      </form>

      <!-- Applications Section -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Applications</h3>
          <UButton
            icon="i-lucide-external-link"
            variant="ghost"
            color="gray"
            label="View All"
            :to="`/admin/applications?programId=${formData.id}`"
          />
        </div>
        <div
          v-if="programsStore.programApplications.length === 0"
          class="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          No applications yet
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="app in programsStore.programApplications.slice(0, 5)"
            :key="app.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ app.firstName }} {{ app.lastName }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ app.email }}</p>
            </div>
            <UBadge :color="getStatusColor(app.status)" variant="subtle" size="xs">
              {{ app.status }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-else>
      <div class="text-center py-8 text-gray-500 dark:text-gray-400">Program not found</div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useProgramsStore } from '~/stores/programs.store';
import { ProgramCategoryEnum } from '~/interfaces/programs.interface';
import type { UpdateProgramDTO } from '~/interfaces/programs.interface';
import { ApplicationStatusEnum } from '~/interfaces/application.interface';

const route = useRoute();
const programsStore = useProgramsStore();
const router = useRouter();
const toast = useToast();

const programId = computed(() => Number(route.params.id));

const formData = ref<UpdateProgramDTO>({
  id: 0,
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
    formData.value.name?.trim() !== '' &&
    formData.value.description?.trim() !== '' &&
    formData.value.category !== null
  );
});

const getStatusColor = (status?: string) => {
  switch (status) {
    case ApplicationStatusEnum.Accepted:
      return 'green';
    case ApplicationStatusEnum.Rejected:
      return 'red';
    case ApplicationStatusEnum.Reviewed:
      return 'blue';
    case ApplicationStatusEnum.Submitted:
      return 'yellow';
    default:
      return 'gray';
  }
};

const loadProgram = async () => {
  try {
    const program = await programsStore.fetchProgram(programId.value);
    formData.value = {
      id: program.id,
      name: program.name,
      description: program.description,
      category: program.category,
      isActive: program.isActive || false,
      subCategory: program.subCategory || '',
      startDate: program.startDate ? program.startDate.split('T')[0] : '',
      endDate: program.endDate ? program.endDate.split('T')[0] : '',
    };

    // Load applications for this program
    await programsStore.fetchProgramApplications(programId.value);
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to load program',
      color: 'red',
    });
  }
};

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
    const submitData: UpdateProgramDTO = {
      id: formData.value.id,
      name: formData.value.name?.trim(),
      description: formData.value.description?.trim(),
      category: formData.value.category,
      isActive: formData.value.isActive,
    };

    if (formData.value.subCategory?.trim()) {
      submitData.subCategory = formData.value.subCategory.trim();
    }
    if (formData.value.startDate) {
      submitData.startDate = formData.value.startDate;
    }
    if (formData.value.endDate) {
      submitData.endDate = formData.value.endDate;
    }

    await programsStore.updateProgram(submitData);
    
    toast.add({
      title: 'Success',
      description: 'Program updated successfully',
      color: 'green',
    });
    
    router.push('/admin/programs');
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update program',
      color: 'red',
    });
  }
};

onMounted(() => {
  loadProgram();
});
</script>
