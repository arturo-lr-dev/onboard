// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL || 'https://ianding.es';

// https://astro.build/config
export default defineConfig({
  site,
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'it', 'fr', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'es',
      locales: {
        es: 'es',
        en: 'en',
        it: 'it',
        fr: 'fr',
        de: 'de',
      },
    },
  })],
  vite: {
    plugins: [tailwindcss()]
  }
});
