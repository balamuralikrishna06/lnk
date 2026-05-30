/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#c5a059", // Warm Gold
        "primary-fixed": "#ffdea5",
        "primary-fixed-dim": "#e9c176",
        "primary-container": "#c5a059",
        "on-primary": "#ffffff",
        "on-primary-container": "#4e3700",
        
        "background": "#faf9f6", // Soft Cream
        
        "on-surface": "#2d2d2d", // Deep Charcoal (Typography)
        "on-surface-variant": "#4e4639",
        "inverse-surface": "#303031",
        "inverse-on-surface": "#f2f0f0",
        
        "secondary": "#5f5e5e",
        "secondary-fixed": "#e4e2e1",
        "secondary-fixed-dim": "#c8c6c6",
        
        "tertiary": "#5e5f5d",
        "tertiary-container": "#a5a5a3",
        
        "surface": "#fbf9f8",
        "surface-bright": "#fbf9f8",
        "surface-dim": "#dbdad9",
        "surface-container": "#efeded",
        "surface-container-low": "#f5f3f3",
        "surface-container-high": "#e9e8e7",
        "surface-container-highest": "#e4e2e2",
        
        "outline": "#7f7667",
        "outline-variant": "#d1c5b4",
        "surface-tint": "#775a19",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "24px",
        "section-gap": "80px",
        "container-max": "1280px",
        "unit": "8px",
        "margin-mobile": "20px",
        "margin-desktop": "64px"
      },
      fontFamily: {
        "headline-lg": ["Playfair Display", "serif"],
        "caption": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "display-lg": ["Playfair Display", "serif"],
        "display-lg-mobile": ["Playfair Display", "serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-md": ["Playfair Display", "serif"]
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "caption": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["36px", { lineHeight: "44px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }]
      }
    },
  },
  plugins: [],
}
