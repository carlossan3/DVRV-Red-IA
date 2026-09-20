import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://carlossan3.github.io',
  base: '/DVRV-Red-IA',

  integrations: [
    mermaid(),

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