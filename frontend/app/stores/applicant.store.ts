import { defineStore } from 'pinia';
import type { Application, ApplicantLogin } from '~/interfaces/application.interface';
import { apiFetch } from '~/utils/api-fetch';
import { getErrorMessage } from '~/utils/error';

/**
 * Applicant Store
 * Manages applicant authentication and application history
 */
export const useApplicantStore = defineStore('applicant', () => {
  const router = useRouter();
  const toast = useToast();

  // Cookies for session persistence
  const applicationIdCookie = useCookie<number | null>('applicant-application-id');
  const applicationsCookie = useCookie<Application[] | null>('applicant-applications');
  const ninCookie = useCookie<string | null>('applicant-nin');

  // State
  const currentApplication = ref<Application | null>(null);
  const applications = ref<Application[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!currentApplication.value && !!ninCookie.value);
  const userApplications = computed(() => applications.value || []);

  /**
   * Login applicant with Application Number and NIN
   */
  const login = async (credentials: ApplicantLogin): Promise<Application | null> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiFetch<Application>('/applications/login', {
        method: 'POST',
        body: credentials,
      });

      currentApplication.value = response;
      applicationIdCookie.value = response.id || null;
      ninCookie.value = credentials.nin;

      // Load all applications for this applicant
      await loadApplications(credentials.nin);

      toast.add({
        color: 'success',
        title: 'Login Successful',
        description: `Welcome back, ${response.firstName}!`,
      });

      return response;
    } catch (err) {
      const errMsg = getErrorMessage(err, 'Failed to login. Please check your credentials.');

      error.value = errMsg;
      toast.add({
        color: 'error',
        title: 'Login Failed',
        description: errMsg,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load all applications for a student by NIN
   */
  const loadApplications = async (nin?: string): Promise<Application[]> => {
    const applicantNin = nin || ninCookie.value;
    if (!applicantNin) {
      error.value = 'NIN is required to load applications';
      return [];
    }

    try {
      loading.value = true;
      error.value = null;

      const allApplications = await apiFetch<Application[]>('/applications/student-history', {
        method: 'POST',
        body: { nin: applicantNin },
      });

      applications.value = allApplications;
      applicationsCookie.value = allApplications;

      return allApplications;
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to load applications');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get a specific application by ID
   */
  const getApplication = async (id: number): Promise<Application | null> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiFetch<Application>(`/applications/single/${id}`);
      return response;
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to fetch application');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout applicant and clear session
   */
  const logout = () => {
    currentApplication.value = null;
    applications.value = [];
    applicationIdCookie.value = null;
    applicationsCookie.value = null;
    ninCookie.value = null;
    error.value = null;

    toast.add({
      color: 'info',
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });

    router.push('/applications/login');
  };

  /**
   * Initialize store from cookies on mount
   */
  const initialize = async () => {
    if (applicationsCookie.value) {
      applications.value = applicationsCookie.value;
    }
    // If we have a NIN but no applications, try to load them
    if (ninCookie.value && applications.value.length === 0) {
      await loadApplications(ninCookie.value);
    }
  };

  return {
    // State
    currentApplication,
    applications,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userApplications,
    
    // Actions
    login,
    loadApplications,
    getApplication,
    logout,
    initialize,
  };
});
