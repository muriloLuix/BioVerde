import type { Config } from 'tailwindcss'

const config: Config = {
  
  theme: {
    extend: {
      fontFamily: {
        koulen: ['Koulen', 'sans-serif'], 
        open_sans: ['Open Sans', 'sans-serif'], 
        bebas_neue: ['Bebas Neue', 'sans-serif'],
        inter: ['Inter' , 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


export default config;
