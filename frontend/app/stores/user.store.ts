import { defineStore } from 'pinia';
import type { FetchError } from '~/interfaces/app.interface';
import { apiFetch } from '~/utils/api-fetch';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  department: string;
  status: string;
  createdAt: string;
}

export interface UserFilter {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
  department?: string;
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchUsers = async (filter: UserFilter) => {
    try {
      loading.value = true;
      const response = await apiFetch<{
        data: User[];
        meta: { total: number; page: number; lastPage: number };
      }>('/users', {
        query: filter,
      });

      users.value = response.data;
      total.value = response.meta.total;
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch users';
    } finally {
      loading.value = false;
    }
  };

  const fetchUser = async (id: number) => {
    try {
      loading.value = true;
      const response = await apiFetch<User>(`/users/${id}`);
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch user';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: number, data: Partial<User>) => {
    try {
      loading.value = true;
      const response = await apiFetch<User>(`/users/${id}`, {
        method: 'PATCH',
        body: data,
      });
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to update user';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      loading.value = true;
      await apiFetch(`/users/${id}`, {
        method: 'DELETE',
      });
      // Remove from local list
      users.value = users.value.filter((u) => u.id !== id);
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to delete user';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const inviteUser = async (data: { email: string; role: string; department: string }) => {
    try {
      loading.value = true;
      const response = await apiFetch('/auth/invite', {
        method: 'POST',
        body: data,
      });
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to invite user';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    total,
    loading,
    error,
    fetchUsers,
    fetchUser,
    updateUser,
    deleteUser,
    inviteUser,
  };
});
