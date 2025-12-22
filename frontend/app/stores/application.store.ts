import { defineStore } from 'pinia';
import type { FetchError } from '~/interfaces/app.interface';
import {
  ApplicationStatusEnum,
  type ApplicantLogin,
  type Application,
  type BankDetail,
  type DocumentUpload,
  type SchoolRecord,
} from '~/interfaces/application.interface';
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
  const applicationIdCookie = useCookie<number | null>('application-id');
  const applicationsCookie = useCookie<Application[] | null>('applications');
  const router = useRouter();

  const application = ref<Application | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const userApplications = computed(() => applicationsCookie.value || []);
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
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Application>('/applications/login', {
        method: 'POST',
        body: credentials,
      });
      application.value = response;
      loadApplications();
      setApplication(response);
      return response;
    } catch (err) {
      const e = err as FetchError;
      error.value = e?.data?.message || 'Failed to login applicant';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    applicationIdCookie.value = null;
    applicationsCookie.value = null;
    router.push({ path: '/' });
  };

  const updateApplication = async (data: Partial<Application>) => {
    if (!data.id) {
      throw new Error('Application ID is required for update');
    }
    const id = data.id;

    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Application>('/applications', {
        method: 'POST',
        body: { ...data, id },
      });
      application.value = response;
      if (response?.id) {
        applicationIdCookie.value = response.id;
      }
      return response;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update application');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // update school record
  const updateSchoolRecord = async (input: SchoolRecord) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<SchoolRecord>(`/applications/school-record`, {
        method: 'POST',
        body: input,
      });

      if (application.value) {
        application.value.schoolRecord = response;
      }
      return response;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update application');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // update bank record
  const updateBankDetails = async (input: BankDetail) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<BankDetail>(`/applications/bank-detail`, {
        method: 'POST',
        body: input,
      });
      if (application.value && response) {
        application.value.bankDetails = response;
      }
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
    }
    loading.value = true;
    error.value = null;
    if (!id && !applicationIdCookie.value) return;
    const applicationId = id || applicationIdCookie.value;
    try {
      const response = await apiFetch<Application>(`/applications/single/${applicationId}`);
      application.value = response;
      return response;
    } catch (err) {
      const e = err as FetchError;
      error.value = getErrorMessage(e?.data?.message, 'Failed to fetch application');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadApplications = async (applicantNin?: string) => {
    let nin = applicantNin;
    if (application.value?.nin) {
      nin = application.value.nin;
    }
    if (!nin) return;
    try {
      loading.value = true;
      error.value = null;
      // Fetch all applications by this student's NIN
      const allApplications = await apiFetch<Application[]>('/applications/student-history', {
        method: 'POST',
        body: { nin },
      });
      applicationsCookie.value = allApplications;
      return allApplications;
    } catch (err) {
      const e = err as FetchError;
      error.value = e?.data?.message || 'Failed to load applications';
    } finally {
      loading.value = false;
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

  const setDocumentUpload = async (input: DocumentUpload) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<DocumentUpload>(`/applications/documents`, {
        method: 'POST',
        body: input,
      });

      if (application.value) {
        application.value.documentUpload = response;
      }
      return response;
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to update application');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const submitApplication = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Application>(`/applications/submit-application`, {
        method: 'PATCH',
        body: { id },
      });
      application.value = response;
      if (application.value) {
        application.value.status = ApplicationStatusEnum.Submitted;
      }
      return response;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to submit application');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const uploadPassport = async (applicationId: number, passport: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch<Application>(`/applications/passport`, {
        method: 'POST',
        body: { applicationId, passport: passport },
      });
      application.value = response;
      application.value!.passport = passport;
      return response;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to upload passport');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    application,
    loading,
    error,
    userApplications,
    startApplication,
    loginApplicant,
    updateApplication,
    uploadFile,
    setApplication,
    updateSchoolRecord,
    updateBankDetails,
    setDocumentUpload,
    submitApplication,
    uploadPassport,
    loadApplications,
    logout,
  };
});
