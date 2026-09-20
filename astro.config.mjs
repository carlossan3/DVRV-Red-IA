import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://carlossan3.github.io',
  base: '/DVRV-Red-IA',

  integrations: [
    starlight({
      title: 'Red e IA',

      description:
        'Apuntes de Programación en Red e IA del Curso de Especialización en Desarrollo de Videojuegos y Realidad Virtual',

      locales: {
        root: {
          label: 'Español',
          lang: 'es',
        },
      },

      defaultLocale: 'root',
      tableOfContents: false,

      components: {
        ThemeProvider: './src/components/Accesibilidad.astro',
      },
    }),
  ],
});