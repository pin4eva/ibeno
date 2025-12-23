<script setup>
const { setUser } = useAuth();
const accessToken = useCookie(ACCESS_TOKEN);
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en',
  },
});

const title = 'Ibeno Host Community Development Trust';
const description =
  'Ibeno Host Community Development Trust is dedicated to the sustainable development and welfare of the Ibeno host community through various initiatives and programs.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image',
});

onMounted(() => {
  const token = accessToken.value;
  if (token) {
    setUser(token);
  }
});
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NuxtLoadingIndicator />
  </UApp>
</template>
