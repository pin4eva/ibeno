import { defineStore } from 'pinia';
import type { FetchError } from '~/interfaces/app.interface';
import { apiFetch } from '~/utils/api-fetch';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
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

export interface Invitation {
  id: number;
  email: string;
  role: string;
  department: string;
  status: string;
  createdAt: string;
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const invitations = ref<Invitation[]>([]);
  const activeCount = ref(0);
  const inactiveCount = ref(0);
  const suspendedCount = ref(0);
  const invitationUrl = '/invitations';

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

  const bulkDeleteUsers = async (ids: number[]) => {
    try {
      loading.value = true;
      await apiFetch('/users/bulk-delete', {
        method: 'DELETE',
        body: { ids },
      });
      users.value = users.value.filter((u) => !ids.includes(u.id));
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to delete users';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const inviteUser = async (data: { email: string; role: string; department: string }) => {
    try {
      loading.value = true;
      const response = await apiFetch(invitationUrl, {
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

  const updateProfile = async (data: Partial<User>) => {
    try {
      loading.value = true;
      const response = await apiFetch<User>('/users/profile', {
        method: 'PATCH',
        body: data,
      });
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to update profile';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (data: { oldPassword: string; newPassword: string }) => {
    try {
      loading.value = true;
      const response = await apiFetch('/users/profile/password', {
        method: 'PATCH',
        body: data,
      });
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to change password';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const fetchInvitations = async () => {
    try {
      loading.value = true;
      const response = await apiFetch<Invitation[]>(invitationUrl);
      invitations.value = response;
      return response;
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to fetch invitations';
    } finally {
      loading.value = false;
    }
  };

  const fetchCounts = async () => {
    try {
      loading.value = true;
      // Active
      const activeResp = await apiFetch<{ data: User[]; meta: { total: number } }>('/users', {
        query: { status: 'Active', limit: 1 },
      });
      activeCount.value = activeResp.meta?.total || 0;

      // Inactive
      const inactiveResp = await apiFetch<{ data: User[]; meta: { total: number } }>('/users', {
        query: { status: 'Inactive', limit: 1 },
      });
      inactiveCount.value = inactiveResp.meta?.total || 0;

      // Suspended
      const suspendedResp = await apiFetch<{ data: User[]; meta: { total: number } }>('/users', {
        query: { status: 'Suspended', limit: 1 },
      });
      suspendedCount.value = suspendedResp.meta?.total || 0;

      // Ensure invitations are fresh
      await fetchInvitations();
    } catch (er: unknown) {
      // ignore counts failure
      console.error(er);
    } finally {
      loading.value = false;
    }
  };

  const deleteInvitation = async (id: number) => {
    try {
      loading.value = true;
      await apiFetch(`/auth/invitations/${id}`, {
        method: 'DELETE',
      });
      invitations.value = invitations.value.filter((i) => i.id !== id);
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to delete invitation';
      throw er;
    } finally {
      loading.value = false;
    }
  };

  const resendInvitation = async (email: string) => {
    try {
      loading.value = true;
      await apiFetch('/auth/send-invitation-email', {
        method: 'PATCH',
        body: { email },
      });
    } catch (er: unknown) {
      error.value = (er as FetchError).data?.message || 'Failed to resend invitation';
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
    invitations,
    activeCount,
    inactiveCount,
    suspendedCount,
    fetchUsers,
    fetchUser,
    updateUser,
    deleteUser,
    inviteUser,
    updateProfile,
    changePassword,
    fetchInvitations,
    fetchCounts,
    deleteInvitation,
    resendInvitation,
    bulkDeleteUsers,
  };
});
