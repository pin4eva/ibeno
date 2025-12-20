<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Edit Program</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update program details
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-file-text"
          color="gray"
          variant="outline"
          label="View Applications"
          :to="`/admin/applications?programId=${route.params.id}`"
        />
        <UButton
          icon="i-lucide-arrow-left"
          color="gray"
          variant="ghost"
          label="Back"
          to="/admin/programs"
        />
      </div>
    </div>

    <div v-if="loadingProgram" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    <UCard v-else-if="program">
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
            <UInput
              v-model="form.startDate"
              type="date"
              :disabled="loading"
            />
          </UFormGroup>

          <!-- End Date -->
          <UFormGroup label="End Date" hint="Optional">
            <UInput
              v-model="form.endDate"
              type="date"
              :disabled="loading"
            />
          </UFormGroup>
        </div>

        <!-- Description -->
        <UFormGroup label="Description" required>
          <UTextarea
            v-model="form.description"
            placeholder="Enter program description"
            :rows="5"
            :disabled="loading"
            required
          />
        </UFormGroup>

        <!-- Banner Image URL (if exists) -->
        <UFormGroup v-if="form.bannerImage" label="Banner Image">
          <div class="space-y-2">
            <img
              :src="form.bannerImage"
              alt="Banner"
              class="w-full max-w-md h-48 object-cover rounded-lg"
            />
            <UInput
              v-model="form.bannerImage"
              placeholder="Banner image URL"
              :disabled="loading"
            />
          </div>
        </UFormGroup>

        <!-- Metadata -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ program.createdAt ? new Date(program.createdAt).toLocaleString() : '-' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ program.updatedAt ? new Date(program.updatedAt).toLocaleString() : '-' }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton
            type="button"
            color="red"
            variant="ghost"
            label="Delete Program"
            icon="i-lucide-trash-2"
            :disabled="loading"
            @click="handleDelete"
          />
          <div class="flex gap-3">
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
              label="Update Program"
              :loading="loading"
              :disabled="loading"
            />
          </div>
        </div>
      </form>
    </UCard>

    <UCard v-else>
      <div class="text-center py-12">
        <UIcon name="i-lucide-alert-circle" class="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Program Not Found</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          The program you're looking for doesn't exist or has been deleted.
        </p>
        <UButton
          color="primary"
          label="Back to Programs"
          to="/admin/programs"
          class="mt-4"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useProgramsStore } from '~/stores/programs.store';
import { ProgramCategoryEnum } from '~/interfaces/programs.interface';

const programsStore = useProgramsStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(false);
const loadingProgram = ref(true);
const program = ref(programsStore.currentProgram);

const form = ref({
  name: '',
  description: '',
  category: '' as string,
  subCategory: '',
  isActive: true,
  startDate: '',
  endDate: '',
  bannerImage: '',
});

const categoryOptions = Object.values(ProgramCategoryEnum).map((cat) => ({
  label: cat,
  value: cat,
}));

const loadProgram = async () => {
  try {
    loadingProgram.value = true;
    const id = Number(route.params.id);
    const prog = await programsStore.fetchProgram(id);
    program.value = prog;

    // Populate form
    form.value = {
      name: prog.name,
      description: prog.description,
      category: prog.category,
      subCategory: prog.subCategory || '',
      isActive: prog.isActive ?? true,
      startDate: prog.startDate ? new Date(prog.startDate).toISOString().split('T')[0] : '',
      endDate: prog.endDate ? new Date(prog.endDate).toISOString().split('T')[0] : '',
      bannerImage: prog.bannerImage || '',
    };
  } catch (error) {
    console.error('Error loading program:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load program',
      color: 'red',
    });
  } finally {
    loadingProgram.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    const data: Record<string, string | boolean | number | null> = {
      id: Number(route.params.id),
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      category: form.value.category,
      isActive: form.value.isActive,
    };

    if (form.value.subCategory?.trim()) {
      data.subCategory = form.value.subCategory.trim();
    }

    if (form.value.startDate) {
      data.startDate = new Date(form.value.startDate).toISOString();
    }

    if (form.value.endDate) {
      data.endDate = new Date(form.value.endDate).toISOString();
    }

    if (form.value.bannerImage?.trim()) {
      data.bannerImage = form.value.bannerImage.trim();
    }

    await programsStore.updateProgram(data);

    toast.add({
      title: 'Success',
      description: 'Program updated successfully',
      color: 'green',
    });

    router.push('/admin/programs');
  } catch (error) {
    console.error('Error updating program:', error);
    toast.add({
      title: 'Error',
      description: programsStore.error || 'Failed to update program',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  if (!program.value) return;

  if (
    !confirm(
      `Are you sure you want to delete "${program.value.name}"? This action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    loading.value = true;
    await programsStore.deleteProgram(Number(route.params.id));

    toast.add({
      title: 'Success',
      description: 'Program deleted successfully',
      color: 'green',
    });

    router.push('/admin/programs');
  } catch (error) {
    console.error('Error deleting program:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to delete program',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/admin/programs');
};

onMounted(() => {
  loadProgram();
});
</script>
