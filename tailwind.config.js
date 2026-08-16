import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        municipal: {
          azul: "#010a26",
          verde: "#3e5902",
          naranja: "#d96704",
          negro: "#0d0d0d",
          crema: "#f1f0d4",
        },
        gravedad: {
          critica: "#be3a3a",
          alta: "#d96704",
          media: "#c49b20",
          baja: "#4d8c2a",
        },
        estado: {
          pendiente: "#c49b20",
          enEspera: "#3a7cb8",
          resuelta: "#4d8c2a",
          rechazada: "#be3a3a",
        },
      },
      fontFamily: {
        sans: ["Congenial", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        modernizacion: {
          primary: "#d96704",
          "primary-content": "#ffffff",
          secondary: "#010a26",
          "secondary-content": "#f1f0d4",
          accent: "#3e5902",
          "accent-content": "#f1f0d4",
          neutral: "#010a26",
          "neutral-content": "#f1f0d4",
          "base-100": "#f1f0d4",
          "base-200": "#ffffff",
          "base-300": "#e8e6c9",
          "base-content": "#0d0d0d",
          info: "#3a7cb8",
          "info-content": "#ffffff",
          success: "#4d8c2a",
          "success-content": "#ffffff",
          warning: "#c49b20",
          "warning-content": "#ffffff",
          error: "#be3a3a",
          "error-content": "#ffffff",
        },
      },
      {
        "modernizacion-dark": {
          primary: "#d96704",
          "primary-content": "#ffffff",
          secondary: "#1a1a2e",
          "secondary-content": "#f1f0d4",
          accent: "#3e5902",
          "accent-content": "#f1f0d4",
          neutral: "#0d0d0d",
          "neutral-content": "#f1f0d4",
          "base-100": "#0d0d0d",
          "base-200": "#16171d",
          "base-300": "#1f2028",
          "base-content": "#f1f0d4",
          info: "#3a7cb8",
          "info-content": "#ffffff",
          success: "#4d8c2a",
          "success-content": "#ffffff",
          warning: "#c49b20",
          "warning-content": "#ffffff",
          error: "#be3a3a",
          "error-content": "#ffffff",
        },
      },
    ],
    darkTheme: "modernizacion-dark",
  },
};
