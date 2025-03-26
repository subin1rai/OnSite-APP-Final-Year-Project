/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
      extend: {
          colors: {
              primary: {
                  100: "#F5F8FF",
                  200: "#EBF4FF"
              },
              secondary: {
                  100: "#F8F8F8",
                  200: "#F1F1F1"
              },
              success: {
                  100: "#F0FFF4",
                  200: "#C6F6D5",
                  300: "#9AE6B4",
                  400: "#68D391"
                 
              },
              danger: {
                  100: "#FFF5F5",
                  200: "#FED7D7",
                  300: "#FEB2B2",
                  400: "#FC8181"
                
              },
              warning: {
                  100: "#FFFBEB",
                  200: "#FEF3C7",
                  300: "#FDE68A",
                  400: "#FACC15"
                 
              },
              general: {
                  100: "#CED1DD",
                  200: "#858585",
                  300: "#EEEEEE",
                  400: "#0CC25F"
                
              },
          },
      },
  },
  plugins: [],
};