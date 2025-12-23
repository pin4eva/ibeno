import type { FetchError } from '~/interfaces/app.interface';

export const useAuth = () => {
  const accessToken = useCookie<string | null>(ACCESS_TOKEN);
  const refreshToken = useCookie<string | null>(REFRESH_TOKEN);
  const { $clearRefreshInterval } = useNuxtApp();
  const config = useRuntimeConfig().public;
  const apiUrl = config.apiBaseUrl;

  const user = useState<User | null>('authUser', () => null);

  const setUser = async (userData?: User | null) => {
    if (userData) {
      user.value = userData;
      return;
    }

    if (!accessToken.value) {
      user.value = null;
      return;
    }

    try {
      const response = await $fetch<User>(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      user.value = response;
      console.log({ response });

      return response;
    } catch (err) {
      const error = err as FetchError;
      console.error(error?.data?.message || 'Failed to fetch user data');
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
    }
  };

  const refreshTokens = async () => {
    try {
      const response = await apiFetch<{ accessToken: string; refreshToken: string }>(
        `${apiUrl}/auth/refresh`,
        {
          method: 'POST',
          body: { refreshToken: refreshToken.value },
        },
      );
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      return response;
    } catch (error) {
      accessToken.value = null;
      refreshToken.value = null;
      user.value = null;
      throw error;
    }
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    window.location.href = '/auth/login';
  };

  onUnmounted(() => {
    $clearRefreshInterval();
    if (accessToken.value) {
      console.log('refreshedTokens');

      refreshTokens().catch((error) => {
        console.error('Error refreshing tokens on unmount:', error);
      });
    }
  });

  return {
    user,
    accessToken,
    refreshToken,
    setUser,
    logout,
  };
};
