<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create Program</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new program to the system</p>
      </div>
      <UButton
        icon="i-lucide-arrow-left"
        color="gray"
        variant="ghost"
        label="Back to Programs"
        to="/admin/programs"
      />
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Program Name -->
          <UFormGroup label="Program Name" required>
            <UInput
              v-model="form.name"
              placeholder="Enter program name"
              :disabled="loading"
              required
            />
          </UFormGroup>

          <!-- Category -->
          <UFormGroup label="Category" required>
            <USelectMenu
              v-model="form.category"
              :items="categoryOptions"
              placeholder="Select category"
              :disabled="loading"
              value-key="value"
              required
            />
          </UFormGroup>

          <!-- Sub-Category -->
          <UFormGroup label="Sub-Category" hint="Optional">
            <UInput
              v-model="form.subCategory"
              placeholder="Enter sub-category"
              :disabled="loading"
            />
          </UFormGroup>

          <!-- Status -->
          <UFormGroup label="Status">
            <div class="flex items-center gap-2">
              <UToggle v-model="form.isActive" :disabled="loading" />
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ form.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </UFormGroup>

          <!-- Start Date -->
          <UFormGroup label="Start Date" hint="Optional">
            <UInput v-model="form.startDate" type="date" :disabled="loading" />
          </UFormGroup>

          <!-- End Date -->
          <UFormGroup label="End Date" hint="Optional">
            <UInput v-model="form.endDate" type="date" :disabled="loading" />
          </UFormGroup>
        </div>

        <!-- Description -->
        <UFormGroup label="Description" required>
          <WysiwygEditor v-model="form.description" :disabled="loading" />
        </UFormGroup>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <UButton
            type="button"
            color="gray"
            variant="ghost"
            label="Cancel"
            :disabled="loading"
            @click="handleCancel"
          />
          <UButton
            type="submit"
            color="primary"
            label="Create Program"
            :loading="loading"
            :disabled="loading"
          />
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useProgramsStore } from '~/stores/programs.store';
import { ProgramCategoryEnum, type CreateProgramDTO } from '~/interfaces/programs.interface';

const programsStore = useProgramsStore();
const router = useRouter();
const toast = useToast();

const loading = ref(false);

const form = ref<{
  name: string;
  description: string;
  category: ProgramCategoryEnum | undefined;
  subCategory: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}>({
  name: '',
  description: '',
  category: undefined,
  subCategory: '',
  isActive: true,
  startDate: '',
  endDate: '',
});

const categoryOptions = Object.values(ProgramCategoryEnum).map((cat) => ({
  label: cat,
  value: cat,
}));

const handleSubmit = async () => {
  try {
    loading.value = true;

    if (!form.value.category) {
      toast.add({ title: 'Error', description: 'Category is required', color: 'red' });
      return;
    }

    const data: CreateProgramDTO = {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      category: form.value.category,
      isActive: form.value.isActive,
    };

    if (form.value.subCategory?.trim()) {
      data.subCategory = form.value.subCategory.trim();
    }

    if (form.value.startDate) {
      data.startDate = new Date(`${form.value.startDate}T00:00:00.000Z`).toISOString();
    }

    if (form.value.endDate) {
      data.endDate = new Date(`${form.value.endDate}T00:00:00.000Z`).toISOString();
    }

    await programsStore.createProgram(data);

    toast.add({
      title: 'Success',
      description: 'Program created successfully',
      color: 'green',
    });

    router.push('/admin/programs');
  } catch (error) {
    console.error('Error creating program:', error);
    toast.add({
      title: 'Error',
      description: programsStore.error || 'Failed to create program',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/admin/programs');
};
</script>
