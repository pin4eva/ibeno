export function apiFetch<T>(request: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const accessToken = useCookie<string>(ACCESS_TOKEN);

  return $fetch<T>(request, {
    baseURL,
    ...options,
    headers: {
      ...options.headers,
      Authorization: accessToken ? `Bearer ${accessToken.value}` : '',
    },
  });
}
