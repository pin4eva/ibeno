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
  const locations = ref<string[]>([]);
  const assetTypes = ref<string[]>([]);

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
      assets.value.unshift(response);
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to create asset';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const updateAsset = async (id: number, data: Partial<UpdateAssetDTO>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Asset>(`/assets/${id}`, {
        method: 'PUT',
        body: data,
      });

      // Update in list
      const index = assets.value.findIndex((a) => a.id === id);
      if (index !== -1) {
        assets.value[index] = response;
      }

      // Update current asset
      if (currentAsset.value?.id === id) {
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

      // Remove from list
      assets.value = assets.value.filter((a) => a.id !== id);

      // Clear current asset if it's the deleted one
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

  const fetchLocations = async () => {
    try {
      const response = await apiFetch<string[]>('/assets/locations');
      locations.value = response;
      return response;
    } catch (er: unknown) {
      console.error('Failed to fetch locations:', er);
      return [];
    }
  };

  const fetchAssetTypes = async () => {
    try {
      const response = await apiFetch<string[]>('/assets/types');
      assetTypes.value = response;
      return response;
    } catch (er: unknown) {
      console.error('Failed to fetch asset types:', er);
      return [];
    }
  };

  const total = computed(() => assets.value.length);

  return {
    assets,
    currentAsset,
    loading,
    error,
    locations,
    assetTypes,
    total,
    fetchAssets,
    fetchAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    fetchLocations,
    fetchAssetTypes,
  };
});
