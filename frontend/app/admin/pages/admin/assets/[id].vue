<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div class="flex items-center gap-2">
      <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" @click="$router.back()" />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Edit Asset</h2>
    </div>

    <UCard v-if="assetsStore.loading && !form.id">
      <div class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      </div>
    </UCard>

    <UCard v-else-if="form.id">
      <form @submit.prevent="handleSubmit" class="space-y-6">
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
              <div class="flex gap-2">
                <UButton type="button" color="gray" variant="outline" @click="fileInput?.click()">
                  {{ form.imageUrl ? 'Change Image' : 'Choose Image' }}
                </UButton>
                <UButton
                  v-if="form.imageUrl && !selectedFile"
                  type="button"
                  color="red"
                  variant="ghost"
                  icon="i-lucide-trash"
                  @click="removeImage"
                >
                  Remove
                </UButton>
              </div>
              <p class="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
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
        <UFormField label="Asset Number" required>
          <UInput v-model="form.assetNumber" placeholder="Asset number" :disabled="true" />
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
          <UButton type="submit" color="primary" :loading="loading"> Update Asset </UButton>
        </div>
      </form>
    </UCard>

    <UCard v-else>
      <p class="text-center text-gray-500 py-8">Asset not found</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FetchError } from '~/interfaces/app.interface';
import type { UpdateAssetDTO } from '~/interfaces/asset.interface';
import { useAssetsStore } from '~/stores/assets.store';

const route = useRoute();
const assetsStore = useAssetsStore();
const toast = useToast();
const router = useRouter();

const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const loading = ref(false);
const imageRemoved = ref(false);

const form = ref<UpdateAssetDTO>({
  id: 0,
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
      color: 'error',
    });
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Error',
      description: 'Please select an image file',
      color: 'error',
    });
    return;
  }

  selectedFile.value = file;
  imageRemoved.value = false;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  imageRemoved.value = true;
  imagePreview.value = null;
  selectedFile.value = null;
  form.value.imageUrl = '';
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
      color: 'error',
    });
    return;
  }

  loading.value = true;

  try {
    // Upload new image if selected
    if (selectedFile.value) {
      form.value.imageUrl = await uploadImage(selectedFile.value);
    } else if (imageRemoved.value) {
      form.value.imageUrl = '';
    }

    // Update asset
    await assetsStore.updateAsset(form.value.id, form.value);

    toast.add({
      title: 'Success',
      description: 'Asset updated successfully',
      color: 'success',
    });

    router.push('/admin/assets');
  } catch (er) {
    const error = er as FetchError;
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'Failed to update asset',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
};

const loadAsset = async () => {
  try {
    const id = parseInt(route.params.id as string);
    const asset = await assetsStore.fetchAsset(id);

    form.value = {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      location: asset.location,
      assetType: asset.assetType || '',
      assetNumber: asset.assetNumber,
      imageUrl: asset.imageUrl || '',
    };

    if (asset.imageUrl) {
      imagePreview.value = asset.imageUrl;
    }
  } catch (er) {
    const error = er as FetchError;
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'Failed to load asset',
      color: 'error',
    });
  }
};

onMounted(() => {
  loadAsset();
});
</script>
