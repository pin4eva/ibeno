import { defineStore } from 'pinia';
import type { Program, CreateProgramDTO, UpdateProgramDTO } from '~/interfaces/programs.interface';
import type { FetchError } from '~/interfaces/app.interface';
import { apiFetch } from '~/utils/api-fetch';

export type { Program };

export interface ProgramFilter {
  category?: string;
  isActive?: boolean;
}

export const useProgramsStore = defineStore('programs', () => {
  const programs = ref<Program[]>([]);
  const currentProgram = ref<Program | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPrograms = async (filter?: ProgramFilter) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Program[]>('/programs', {
        query: filter,
      });
      programs.value = response;
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch programs';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const fetchProgram = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Program>(`/programs/single/${id}`);
      currentProgram.value = response;
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch program';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const createProgram = async (data: CreateProgramDTO) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Program>('/programs', {
        method: 'POST',
        body: data,
      });
      // Add to local list
      programs.value.unshift(response);
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to create program';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const updateProgram = async (data: UpdateProgramDTO) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Program>('/programs', {
        method: 'PUT',
        body: data,
      });
      // Update in local list
      const index = programs.value.findIndex((p) => p.id === data.id);
      if (index !== -1) {
        programs.value[index] = response;
      }
      if (currentProgram.value?.id === data.id) {
        currentProgram.value = response;
      }
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to update program';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const deleteProgram = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await apiFetch(`/programs/single/${id}`, {
        method: 'POST',
      });
      // Remove from local list
      programs.value = programs.value.filter((p) => p.id !== id);
      if (currentProgram.value?.id === id) {
        currentProgram.value = null;
      }
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to delete program';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const toggleProgramStatus = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Program>(`/programs/enrollment/${id}/toggle`, {
        method: 'POST',
      });
      // Update in local list
      const index = programs.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        programs.value[index] = response;
      }
      if (currentProgram.value?.id === id) {
        currentProgram.value = response;
      }
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to toggle program status';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const stats = computed(() => {
    const total = programs.value.length;
    const active = programs.value.filter((p) => p.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  });

  return {
    programs,
    currentProgram,
    loading,
    error,
    stats,
    fetchPrograms,
    fetchProgram,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleProgramStatus,
  };
});
