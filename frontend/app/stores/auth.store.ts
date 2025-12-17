import { defineStore } from 'pinia';
import type { FetchError } from '~/interfaces/app.interface';
import type { ChangePasswordDTO, LoginDTO, SignupDTO } from '~/interfaces/auth.interface';

export interface User {
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
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// export const useAuthStore = defineStore('auth', {
//   state: (): AuthState => ({
//     user: null,
//     accessToken: null, // Should ideally be stored in HttpOnly cookie, but for now state/localStorage
//     refreshToken: null,
//     loading: false,
//     error: null,
//   }),

//   getters: {
//     isAuthenticated: (state) => !!state.accessToken,
//     fullName: (state) => (state.user ? `${state.user.firstName} ${state.user.lastName}` : ''),
//   },

//   actions: {
//     async login(credentials: any) {
//       this.loading = true;
//       this.error = null;
//       try {
//         // TODO: Replace with actual API call using useApi or $fetch
//         // const response = await $fetch('/api/auth/login', { method: 'POST', body: credentials });

//         // Mocking response for now based on auth.service.ts structure
//         console.log('Logging in with', credentials);

//         // Simulate API delay
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         // Mock success
//         // this.setSession(response);
//       }
//       catch (err: any) {
//         this.error = err.message || 'Login failed';
//         throw err;
//       }
//       finally {
//         this.loading = false;
//       }
//     },

//     async signup(data: any) {
//       this.loading = true;
//       this.error = null;
//       try {
//         // const response = await $fetch('/api/auth/signup', { method: 'POST', body: data });
//         console.log('Signing up with', data);
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//       catch (err: any) {
//         this.error = err.message || 'Signup failed';
//         throw err;
//       }
//       finally {
//         this.loading = false;
//       }
//     },

//     async forgotPassword(email: string) {
//       this.loading = true;
//       this.error = null;
//       try {
//         // await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email } });
//         console.log('Forgot password for', email);
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//       catch (err: any) {
//         this.error = err.message || 'Request failed';
//         throw err;
//       }
//       finally {
//         this.loading = false;
//       }
//     },

//     setSession(authResult: { accessToken: string; refreshToken: string; user?: User }) {
//       this.accessToken = authResult.accessToken;
//       this.refreshToken = authResult.refreshToken;
//       if (authResult.user) {
//         this.user = authResult.user;
//       }
//       // Save to localStorage or cookies if needed
//     },

//     logout() {
//       this.user = null;
//       this.accessToken = null;
//       this.refreshToken = null;
//       // Clear cookies/localStorage
//     },
//   },
// });

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = useCookie<string | null>('access_token');
  const refreshToken = useCookie<string | null>('refresh_token');
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl + '/auth';

  const login = async ({ email, password }: LoginDTO) => {
    try {
      loading.value = true;
      const response = await $fetch<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        passwordUpdateRequired?: boolean;
        otp?: number;
      }>(apiBaseUrl + '/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response?.success) {
        accessToken.value = response.accessToken;
        refreshToken.value = response.refreshToken;
        error.value = null;
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
      const response = await $fetch<{ success: boolean; message: string }>(apiBaseUrl + '/signup', {
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
      const response = await $fetch<{ success: boolean; message: string }>(
        apiBaseUrl + '/forgot-password',
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
      const response = await $fetch<{ success: boolean; message: string }>(
        apiBaseUrl + '/reset-password',
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
