import { UserRoleEnum } from '~/interfaces/auth.interface';

export default defineNuxtRouteMiddleware((to) => {
  const accessToken = useCookie<string | null>(ACCESS_TOKEN);
  const { user } = useAuth();
  const isAuthenticated = !!accessToken.value;

  if (!isAuthenticated) {
    return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath));
  }

  const userRole = user.value?.role;
  if (userRole === UserRoleEnum.User) {
    return abortNavigation({
      statusMessage: 'Access Denied',
      statusCode: 403,
    });
  }
});
