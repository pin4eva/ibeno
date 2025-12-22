import { ACCESS_TOKEN, REFRESH_TOKEN } from '../utils/constants';
export default defineNuxtPlugin({
  name: 'refresh-token',
  async setup() {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    onNuxtReady(() => {
      intervalId = setInterval(
        async () => {
          const environment = useRuntimeConfig().public;
          const refreshToken = useCookie<string>(REFRESH_TOKEN);
          const accessToken = useCookie<string>(ACCESS_TOKEN);
          const apiUrl = environment.apiBaseUrl + '/auth/refresh';
          if (refreshToken.value) {
            try {
              // Ping the API to keep the session alive
              await $fetch<{ access_token: string }>(apiUrl, {
                method: 'POST',
                body: {
                  refresh_token: refreshToken.value,
                },
              }).then(({ access_token }) => {
                accessToken.value = access_token;
              });
              console.log('Session keep-alive ping successful.');
            } catch (error) {
              console.error('Error during session keep-alive ping:', error);
              refreshToken.value = '';
              accessToken.value = '';
            }
          }
        },
        10 * 60 * 1000,
      ); // Every 10 minutes
    });

    // Provide cleanup function for manual interval clearing
    return {
      provide: {
        clearRefreshInterval: () => {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        },
      },
    };
  },
});
