import { defineStore } from 'pinia';
import type { Asset, CreateAssetDTO, UpdateAssetDTO, AssetFilter } from '~/interfaces/asset.interface';
import type { FetchError } from '~/interfaces/app.interface';
import { apiFetch } from '~/utils/api-fetch';

export type { Asset };

export const useAssetsStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([]);
  const currentAsset = ref<Asset | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAssets = async (filter?: AssetFilter) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Asset[]>('/assets', {
        query: filter,
      });
      assets.value = response;
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch assets';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const fetchAsset = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Asset>(`/assets/${id}`);
      currentAsset.value = response;
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch asset';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const createAsset = async (data: CreateAssetDTO) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Asset>('/assets', {
        method: 'POST',
        body: data,
      });
      // Add to local list
      assets.value.unshift(response);
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to create asset';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const updateAsset = async (data: UpdateAssetDTO) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Asset>('/assets', {
        method: 'PUT',
        body: data,
      });
      // Update in local list
      const index = assets.value.findIndex((a) => a.id === data.id);
      if (index !== -1) {
        assets.value[index] = response;
      }
      if (currentAsset.value?.id === data.id) {
        currentAsset.value = response;
      }
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to update asset';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const deleteAsset = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await apiFetch(`/assets/${id}`, {
        method: 'DELETE',
      });
      // Remove from local list
      assets.value = assets.value.filter((a) => a.id !== id);
      if (currentAsset.value?.id === id) {
        currentAsset.value = null;
      }
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to delete asset';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const stats = computed(() => {
    const total = assets.value.length;
    const withImages = assets.value.filter((a) => a.imageUrl).length;
    const locations = new Set(assets.value.map((a) => a.location)).size;
    return { total, withImages, locations };
  });

  return {
    assets,
    currentAsset,
    loading,
    error,
    fetchAssets,
    fetchAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    stats,
  };
});
