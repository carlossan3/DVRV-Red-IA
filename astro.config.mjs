import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import {
  mermaidMdast,
  mermaidHast,
} from '@xingwangzhe/satteri-mermaid';

export default defineConfig({
  site: 'https://carlossan3.github.io',
  base: '/DVRV-Red-IA',

  markdown: {
    processor: satteri({
      mdastPlugins: [mermaidMdast()],
      hastPlugins: [mermaidHast()],
    }),
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