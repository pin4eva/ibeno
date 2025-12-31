import { UserRoleEnum } from '~/interfaces/user.interface';

export default defineNuxtRouteMiddleware(async (to) => {
  const accessToken = useCookie<string | null>(ACCESS_TOKEN);
  const { user, setUser } = useAuth();
  const isAuthenticated = !!accessToken.value;

  if (!isAuthenticated) {
    return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath));
  } else if (isAuthenticated && !user) {
    await setUser();
  }

  const userRole = user.value?.role;
  if (userRole === UserRoleEnum.User) {
    return abortNavigation({
      statusMessage: 'Access Denied',
      statusCode: 403,
    });
  }
});
