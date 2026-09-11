// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: replace with the final domain before the first production build.
  // Required by @astrojs/sitemap and by absolute Open Graph URLs — without it,
  // link previews on LinkedIn and Slack render broken.
  site: 'https://example.com',

  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      // English serves from `/`, Spanish from `/es/`. Keeping the root a real
      // page rather than a redirect saves a round trip on the most-shared URL.
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    react(),
    sitemap({
      // Emits hreflang alternates into the sitemap so search engines pair the
      // two versions instead of treating them as duplicate content.
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],

  build: {
    // Emit `/about/index.html` so static hosts resolve extensionless URLs
    // the same way locally and in production.
    format: 'directory',
  },
});
