/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#A3E635",  // Verde lima claro
          secondary: "#FBBF24", // Naranja suave
          accent: "#059669",    // Verde esmeralda
          mutedLight: "#F9FAFB",// Blanco humo
          mutedDark: "#374151", // Gris carbón
          success: "#6EE7B7"    // Verde menta
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
};
