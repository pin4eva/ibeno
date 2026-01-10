import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@vueuse/core': fileURLToPath(new URL('./app/utils/vueuse-core-shim.ts', import.meta.url)),
    'vueuse-core-original': fileURLToPath(
      new URL('./node_modules/@vueuse/core/dist/index.js', import.meta.url),
    ),
  },
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
  vite: {
    optimizeDeps: {
      include: [
        'prosemirror-state',
        'prosemirror-transform',
        'prosemirror-model',
        'prosemirror-view',
        'prosemirror-gapcursor',
      ],
    },
  },
  ui: {
    fonts: false,
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
