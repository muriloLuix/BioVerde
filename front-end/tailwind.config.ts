import type { Config } from "tailwindcss";

const config: Config = {
	theme: {
		extend: {
			fontFamily: {
				koulen: ["Koulen", "sans-serif"],
				open_sans: ["Open Sans", "sans-serif"],
				bebas_neue: ["Bebas Neue", "sans-serif"],
				inter: ["Inter", "sans-serif"],
				montserrat: ["Montserrat", "sans-serif"],
			},
			keyframes: {
				toastFade: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"10%": { opacity: "1", transform: "translateY(0)" },
					"80%": { opacity: "0.75", transform: "translateY(0)" },
					"100%": { opacity: "0", transform: "translateY(10px)" },
				},
			},
			animation: {
				toastFade: "toastFade duration-5000 ease-in-out forwards",
			},
		},
	},
	plugins: [],
};

export default config;
