export function apiFetch<T>(request: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
  const config = useRuntimeConfig();

  return $fetch<T>(request, {
    baseURL: config.public.apiBaseUrl,
    ...options,
  });
}
