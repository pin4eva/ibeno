export default defineNuxtRouteMiddleware((to) => {
  const accessToken = useCookie<string | null>(ACCESS_TOKEN);
  const isAuthenticated = !!accessToken.value;

  if (!isAuthenticated) {
    return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath));
  }

  const publicRoutes = ['auth/login', 'auth/signup', 'auth/forgot-password', '/'];

  const requiresAuth = !publicRoutes.includes(to.path);

  if (requiresAuth && !isAuthenticated) {
    return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath));
  }
});
