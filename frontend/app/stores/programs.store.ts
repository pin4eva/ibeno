import { defineStore } from 'pinia';
import type { Program, CreateProgramDTO, UpdateProgramDTO } from '~/interfaces/programs.interface';
import type { Application } from '~/interfaces/application.interface';
import type { FetchError } from '~/interfaces/app.interface';
import { apiFetch } from '~/utils/api-fetch';

export interface ProgramFilter {
  category?: string;
  isActive?: boolean;
}

export interface ProgramStats {
  total: number;
  active: number;
  inactive: number;
}

export const useProgramsStore = defineStore('programs', () => {
  const programs = ref<Program[]>([]);
  const currentProgram = ref<Program | null>(null);
  const programApplications = ref<Application[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const stats = ref<ProgramStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const fetchPrograms = async (filter?: ProgramFilter) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Program[]>('/programs', {
        query: filter,
      });
      programs.value = response;
      
      // Calculate stats
      stats.value = {
        total: response.length,
        active: response.filter((p) => p.isActive).length,
        inactive: response.filter((p) => !p.isActive).length,
      };
      
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

  const fetchProgramApplications = async (programId: number) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Application[]>('/applications', {
        query: { programId },
      });
      programApplications.value = response;
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch applications';
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
      programs.value.unshift(response);
      stats.value.total++;
      if (response.isActive) {
        stats.value.active++;
      } else {
        stats.value.inactive++;
      }
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
        const oldProgram = programs.value[index];
        programs.value[index] = response;
        
        // Update stats if isActive changed
        if (oldProgram && oldProgram.isActive !== response.isActive) {
          if (response.isActive) {
            stats.value.active++;
            stats.value.inactive--;
          } else {
            stats.value.active--;
            stats.value.inactive++;
          }
        }
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
      
      // Remove from local list and update stats
      const program = programs.value.find((p) => p.id === id);
      if (program) {
        programs.value = programs.value.filter((p) => p.id !== id);
        stats.value.total--;
        if (program.isActive) {
          stats.value.active--;
        } else {
          stats.value.inactive--;
        }
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
        const oldProgram = programs.value[index];
        programs.value[index] = response;
        
        // Update stats
        if (oldProgram && response.isActive !== oldProgram.isActive) {
          if (response.isActive) {
            stats.value.active++;
            stats.value.inactive--;
          } else {
            stats.value.active--;
            stats.value.inactive++;
          }
        }
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

  return {
    programs,
    currentProgram,
    programApplications,
    loading,
    error,
    stats,
    fetchPrograms,
    fetchProgram,
    fetchProgramApplications,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleProgramStatus,
  };
});
