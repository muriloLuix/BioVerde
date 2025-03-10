import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        koulen: ['Koulen', 'sans-serif'], 
        kufam: ['Kufam', 'sans-serif'], 
      },
      colors: {
        custom1: '#DAD7CD', // Cinza claro/bege
        custom2: '#A3B18A', // Verde claro
        custom3: '#588157', // Verde médio
        custom4: '#3A5A40', // Verde escuro
        verdeEscuro: '#344E41', // Verde mais escuro
      },
    },
  },
  plugins: [],
};

export default config;
