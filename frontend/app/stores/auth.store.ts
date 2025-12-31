import { defineStore } from 'pinia';
import type { FetchError } from '~/interfaces/app.interface';
import type {
  ChangePasswordDTO,
  LoginDTO,
  LoginResponse,
  SignupDTO,
} from '~/interfaces/auth.interface';
import { apiFetch } from '~/utils/api-fetch';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '~/utils/constants';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  department: string;
  status: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const accessToken = useCookie<string | null>(ACCESS_TOKEN);
  const refreshToken = useCookie<string | null>(REFRESH_TOKEN);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const { setUser } = useAuth();

  const login = async ({ email, password }: LoginDTO) => {
    try {
      loading.value = true;
      const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response?.success) {
        accessToken.value = response.accessToken;
        refreshToken.value = response.refreshToken;
        error.value = null;
        setUser();
      }
      return response;
    } catch (er) {
      const e = er as FetchError;
      error.value = e.data?.message || 'Login failed';
      throw e; // Re-throw to let component handle if needed or just rely on return
    } finally {
      loading.value = false;
    }
  };

  const signup = async (input: SignupDTO) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string }>('/auth/signup', {
        method: 'POST',
        body: input,
      });

      return response;
    } catch (er) {
      error.value = (er as FetchError).data?.message || 'Signup failed';
    } finally {
      loading.value = false;
    }
  };
  const forgotPassword = async (email: string) => {
    try {
      error.value = null;
      loading.value = true;
      const response = await apiFetch<{ success: boolean; message: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: { email },
        },
      );

      return response;
    } catch (er) {
      const e = er as FetchError;
      error.value = e.data?.message || 'Request failed';
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (input: ChangePasswordDTO) => {
    try {
      error.value = null;
      loading.value = true;
      const response = await apiFetch<{ success: boolean; message: string }>(
        '/auth/reset-password',
        {
          method: 'POST',
          body: input,
        },
      );
      console.log('response', response);

      return response;
    } catch (er) {
      const e = er as FetchError;
      error.value = e.data?.message || 'Request failed';
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    signup,
    forgotPassword,
    resetPassword,
  };
});
