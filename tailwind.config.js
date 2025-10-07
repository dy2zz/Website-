/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/templates/**/*.html", // Scans all HTML files in the templates folder
    "./src/js/**/*.js",         // Scans all JS files in the js folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}