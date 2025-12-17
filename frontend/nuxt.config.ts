// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],

  compatibilityDate: '2025-01-15',
  devtools: {
    enabled: true,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api',
    },
  },
  css: ['~/assets/css/main.css'],
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'tertiary',
        'success',
        'warning',
        'error',
        'white',
        'info',
        'blue',
        'orange',
        'green',
        'red',
        'purple',
        'pink',
        'yellow',
        'teal',
        'cyan',
        'indigo',
        'gray',
        'neutral',
        'black',
        'slate',
      ],
    },
  },

  routeRules: {
    '/': { prerender: true },
  },
  extends: ['./app/admin/nuxt.config.ts'],
});
