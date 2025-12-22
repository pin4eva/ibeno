<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div class="flex items-center gap-2">
      <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" @click="$router.back()" />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create Asset</h2>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <!-- Image Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Asset Image
          </label>
          <div class="flex items-center gap-4">
            <div
              v-if="imagePreview"
              class="w-32 h-32 rounded border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-32 h-32 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
            >
              <UIcon name="i-lucide-image" class="w-12 h-12 text-gray-400" />
            </div>
            <div class="flex-1">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              <UButton type="button" color="gray" variant="outline" @click="fileInput?.click()">
                Choose Image
              </UButton>
              <p class="text-sm text-gray-500 mt-1">Optional. Max file size: 5MB</p>
            </div>
          </div>
        </div>

        <!-- Asset Name -->
        <UFormField label="Asset Name" required>
          <UInput v-model="form.name" placeholder="Enter asset name" :disabled="loading" />
        </UFormField>

        <!-- Description -->
        <UFormField label="Description" required>
          <UTextarea
            v-model="form.description"
            placeholder="Enter asset description"
            class="w-full"
            :rows="4"
            :disabled="loading"
          />
        </UFormField>

        <!-- Location -->
        <UFormField label="Location" required>
          <UInput v-model="form.location" placeholder="Enter asset location" :disabled="loading" />
        </UFormField>

        <!-- Asset Type -->
        <UFormField label="Asset Type">
          <UInput
            v-model="form.assetType"
            placeholder="Enter asset type (e.g., Furniture, Electronics)"
            :disabled="loading"
          />
        </UFormField>

        <!-- Asset Number -->
        <UFormField label="Asset Number" help="Leave empty to auto-generate">
          <UInput
            v-model="form.assetNumber"
            placeholder="Auto-generated if empty"
            :disabled="loading"
          />
        </UFormField>

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <UButton
            type="button"
            color="gray"
            variant="ghost"
            @click="$router.back()"
            :disabled="loading"
          >
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="loading"> Create Asset </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FetchError } from '~/interfaces/app.interface';
import type { CreateAssetDTO } from '~/interfaces/asset.interface';
import { useAssetsStore } from '~/stores/assets.store';

const assetsStore = useAssetsStore();
const toast = useToast();
const router = useRouter();

const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const loading = ref(false);

const form = ref<CreateAssetDTO>({
  name: '',
  description: '',
  location: '',
  assetType: '',
  assetNumber: '',
  imageUrl: '',
});

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      title: 'Error',
      description: 'File size must be less than 5MB',
      color: 'red',
    });
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Error',
      description: 'Please select an image file',
      color: 'red',
    });
    return;
  }

  selectedFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiFetch<{ url: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
    return response.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

const handleSubmit = async () => {
  // Validate required fields
  if (!form.value.name || !form.value.description || !form.value.location) {
    toast.add({
      title: 'Error',
      description: 'Please fill in all required fields',
      color: 'red',
    });
    return;
  }

  loading.value = true;

  try {
    // Upload image if selected
    if (selectedFile.value) {
      form.value.imageUrl = await uploadImage(selectedFile.value);
    }

    // Create asset
    await assetsStore.createAsset(form.value);

    toast.add({
      title: 'Success',
      description: 'Asset created successfully',
      color: 'green',
    });

    router.push('/admin/assets');
  } catch (error) {
    const err = error as FetchError;
    toast.add({
      title: 'Error',
      description: err?.data?.message || 'Failed to create asset',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};
</script>
