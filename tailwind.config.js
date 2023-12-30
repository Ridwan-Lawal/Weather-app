/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      poppins: ["Poppins", "sans-serif"],
      raleway: ["Raleway", "sans-serif"],
    },
    extend: {
      backgroundImage: {
        header: "url('/public/sky.svg')",
      },
    },
  },
  plugins: [],
};
