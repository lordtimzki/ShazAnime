/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0088ff",
        "primary-dark": "#0066cc",
        "accent-blue": "#2196f3",
        "background-dark": "#0a1120",
        "surface-dark": "#101b33",
        "surface-darker": "#080e1a",
        "surface-border": "#1e3a5f",
        "text-dim": "#8892b0",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-right": "slideRight 0.7s ease-out both",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px -5px rgba(0, 136, 255, 0.5)" },
          "100%": { boxShadow: "0 0 50px 10px rgba(64, 196, 255, 0.6)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          from: { opacity: "0", transform: "translateX(40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
