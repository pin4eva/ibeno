import { defineStore } from 'pinia';
import type { Application, ApplicantLogin } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';

type ApiErrorData = {
  message?: string;
};

type FetchErrorLike = {
  data?: ApiErrorData;
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as FetchErrorLike;
    return err.data?.message || err.message || fallback;
  }
  return fallback;
}

export type StartApplicationInput = Pick<
  Application,
  'programId' | 'firstName' | 'lastName' | 'email' | 'phone' | 'nin' | 'dob' | 'gender'
> &
  Partial<Pick<Application, 'middleName'>>;

export const useApplicationStore = defineStore('application', () => {
  const application = ref<Application | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const startApplication = async (data: StartApplicationInput) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiFetch<Application>('/applications', {
        method: 'POST',
        body: data,
      });
      application.value = response;
      return response;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to start application');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loginApplicant = async (credentials: ApplicantLogin) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiFetch<Application>('/applications/login', {
        method: 'POST',
        body: credentials,
      });
      application.value = response;
      return response;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Login failed');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateApplication = async (data: Partial<Application>) => {
    if (!data.id) {
      throw new Error('Application ID is required for update');
    }
    const id = data.id;
    loading.value = true;
    error.value = null;

    try {
      const response = await apiFetch<Application>('/applications', {
        method: 'POST',
        body: { ...data, id },
      });
      application.value = response;
      return response;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update application');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setApplication = async (data?: Application | null, id?: number) => {
    if (data) {
      application.value = data || null;
      return data;
    } else if (id) {
      loading.value = true;
      error.value = null;
      try {
        const response = await apiFetch<Application>(`/applications/single/${id}`);
        application.value = response;
        return response;
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Failed to fetch application');
        throw err;
      } finally {
        loading.value = false;
      }
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiFetch<{ url: string }>('/upload', {
        method: 'POST',
        body: formData,
      });
      return response.url;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Upload failed');
      throw err;
    }
  };

  return {
    application,
    loading,
    error,
    startApplication,
    loginApplicant,
    updateApplication,
    uploadFile,
    setApplication,
  };
});
