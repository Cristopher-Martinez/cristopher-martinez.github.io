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

  integrations: [react(), sitemap()],

  build: {
    // Emit `/about/index.html` so static hosts resolve extensionless URLs
    // the same way locally and in production.
    format: 'directory',
  },
});
