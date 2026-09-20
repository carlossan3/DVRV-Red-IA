import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkMermaid } from 'astro-mermaid-renderer/remark-mermaid';

export default defineConfig({
  site: 'https://carlossan3.github.io',
  base: '/DVRV-Red-IA',

  markdown: {
    remarkPlugins: [remarkMermaid],
  },

  integrations: [
    starlight({
      title: 'Programación en red e Inteligencia Artificial',

      locales: {
        root: {
          label: 'Español',
          lang: 'es',
        },
      },

      defaultLocale: 'root',
    }),
  ],
});