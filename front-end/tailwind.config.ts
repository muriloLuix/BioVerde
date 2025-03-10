import type { Config } from 'tailwindcss'


const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        koulen: ['Koulen', 'sans-serif'], 
        kufam: ['Kufam', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};

export default config;
