/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        schulz: {
          blue: '#004B87',
          dark: '#002E54',
          light: '#E6F0FA',
          accent: '#0085CA'
        },
        ska: {
          orange: '#FF6B00',
          dark: '#C75300',
          light: '#FFF0E6'
        }
      }
    },
  },
  plugins: [],
}
