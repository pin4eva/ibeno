<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Edit Asset</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Update asset information</p>
      </div>
      <UButton
        icon="i-lucide-arrow-left"
        color="gray"
        variant="ghost"
        label="Back to Assets"
        to="/admin/assets"
      />
    </div>

    <UCard v-if="!assetsStore.loading && assetsStore.currentAsset">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Asset Name -->
          <UFormGroup label="Asset Name" required>
            <UInput
              v-model="form.name"
              placeholder="Enter asset name"
              :disabled="loading"
              required
            />
          </UFormGroup>

          <!-- Location -->
          <UFormGroup label="Location" required>
            <UInput
              v-model="form.location"
              placeholder="Enter location"
              :disabled="loading"
              required
            />
          </UFormGroup>

          <!-- Asset Number -->
          <UFormGroup label="Asset Number" required class="md:col-span-2">
            <UInput
              v-model="form.assetNumber"
              placeholder="Asset number"
              :disabled="loading"
              required
            />
          </UFormGroup>
        </div>

        <!-- Description -->
        <UFormGroup label="Description" required>
          <UTextarea
            v-model="form.description"
            placeholder="Enter asset description"
            :disabled="loading"
            :rows="4"
            required
          />
        </UFormGroup>

        <!-- Image Upload -->
        <UFormGroup label="Asset Image" hint="Optional">
          <div class="space-y-3">
            <div v-if="imagePreview" class="relative w-32 h-32">
              <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover rounded-lg" />
              <UButton
                icon="i-lucide-x"
                size="sm"
                color="red"
                variant="solid"
                class="absolute -top-2 -right-2"
                @click="clearImage"
              />
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />
            <UButton
              icon="i-lucide-upload"
              color="gray"
              variant="outline"
              label="Upload New Image"
              :loading="uploading"
              :disabled="loading || uploading"
              @click="() => fileInput?.click()"
            />
          </div>
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
            label="Update Asset"
            :loading="loading"
            :disabled="loading || uploading"
          />
        </div>
      </form>
    </UCard>

    <UCard v-else-if="assetsStore.loading">
      <div class="flex justify-center py-8">
        <USkeleton class="h-4 w-32" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useAssetsStore } from '~/stores/assets.store';
import type { UpdateAssetDTO } from '~/interfaces/asset.interface';

const route = useRoute();
const assetsStore = useAssetsStore();
const loading = ref(false);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

const assetId = computed(() => parseInt(route.params.id as string, 10));

const form = ref<UpdateAssetDTO>({
  id: assetId.value,
  name: '',
  description: '',
  location: '',
  assetNumber: '',
  imageUrl: '',
});

// Fetch asset on mount
onMounted(async () => {
  try {
    await assetsStore.fetchAsset(assetId.value);
    if (assetsStore.currentAsset) {
      form.value = { ...assetsStore.currentAsset };
      imagePreview.value = assetsStore.currentAsset.imageUrl || null;
    }
  } catch (error) {
    useToast().add({
      title: 'Error',
      description: 'Failed to load asset',
      color: 'red',
    });
    navigateTo('/admin/assets');
  }
});

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    useToast().add({
      title: 'Error',
      description: 'File size must be less than 5MB',
      color: 'red',
    });
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    useToast().add({
      title: 'Error',
      description: 'Please select an image file',
      color: 'red',
    });
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // Upload file
  try {
    uploading.value = true;
    const formData = new FormData();
    formData.append('file', file);

    const config = useRuntimeConfig();
    const response = await $fetch<{ url: string }>('/upload', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      body: formData,
    });

    form.value.imageUrl = response.url;
    useToast().add({
      title: 'Success',
      description: 'Image uploaded successfully',
      color: 'green',
    });
  } catch (error) {
    console.error('Upload error:', error);
    useToast().add({
      title: 'Error',
      description: 'Failed to upload image',
      color: 'red',
    });
    imagePreview.value = assetsStore.currentAsset?.imageUrl || null;
  } finally {
    uploading.value = false;
  }
};

const clearImage = () => {
  form.value.imageUrl = '';
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    await assetsStore.updateAsset(form.value);
    useToast().add({
      title: 'Success',
      description: 'Asset updated successfully',
      color: 'green',
    });
    navigateTo('/admin/assets');
  } catch (error) {
    console.error('Update error:', error);
    useToast().add({
      title: 'Error',
      description: 'Failed to update asset',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  navigateTo('/admin/assets');
};
</script>
