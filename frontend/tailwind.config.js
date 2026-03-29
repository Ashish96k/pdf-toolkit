/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E63946",
        "primary-light": "#FF6B6B",
        "primary-dark": "#C1121F",
        "primary-glow": "rgba(230,57,70,0.4)",
        surface: "rgba(255,255,255,0.03)",
        "surface-hover": "rgba(255,255,255,0.06)",
        "surface-border": "rgba(255,255,255,0.07)",
        "surface-border-hover": "rgba(255,255,255,0.14)",
        "text-primary": "#FFFFFF",
        "text-secondary": "rgba(255,255,255,0.55)",
        "text-muted": "rgba(255,255,255,0.25)",
        "page-bg": "#080010",
        "progress-tip": "#FF8A92",
        "gradient-pink": "#F9A8D4",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "page-gradient":
          "linear-gradient(135deg, #1a0005 0%, #0d0010 40%, #000814 100%)",
        "card-shimmer":
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
        "btn-primary": "linear-gradient(135deg, #E63946, #C1121F)",
        "btn-primary-hover":
          "linear-gradient(135deg, #FF6B6B, #E63946)",
        "hero-glow":
          "radial-gradient(ellipse at center, rgba(230,57,70,0.12) 0%, transparent 60%)",
        "blob-red":
          "radial-gradient(circle, rgba(230,57,70,0.28) 0%, transparent 70%)",
        "blob-purple":
          "radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%)",
        "progress-fill":
          "linear-gradient(90deg, #C1121F, #E63946, #FF6B6B)",
        "top-line":
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        "top-line-red":
          "linear-gradient(90deg, transparent, rgba(230,57,70,0.5), transparent)",
        "badge-merge":
          "linear-gradient(135deg, rgba(230,57,70,0.28), rgba(230,57,70,0.08))",
        "badge-split":
          "linear-gradient(135deg, rgba(168,85,247,0.28), rgba(168,85,247,0.08))",
        "badge-compress":
          "linear-gradient(135deg, rgba(59,130,246,0.28), rgba(59,130,246,0.08))",
        "badge-convert":
          "linear-gradient(135deg, rgba(34,197,94,0.28), rgba(34,197,94,0.08))",
        "badge-edit":
          "linear-gradient(135deg, rgba(249,115,22,0.28), rgba(249,115,22,0.08))",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        pill: "100px",
      },
      boxShadow: {
        "glow-red": "0 0 30px rgba(230,57,70,0.3)",
        "glow-red-lg": "0 0 60px rgba(230,57,70,0.4)",
        "card-hover":
          "0 20px 60px rgba(230,57,70,0.2), 0 0 0 1px rgba(230,57,70,0.15)",
        btn: "0 4px 24px rgba(230,57,70,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        "btn-hover":
          "0 8px 36px rgba(230,57,70,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
        "upload-zone": "inset 0 0 60px rgba(230,57,70,0.04)",
        "progress-fill": "0 0 12px rgba(230,57,70,0.6)",
        "progress-tip": "0 0 8px rgba(255,138,146,0.8)",
        "badge-merge": "0 0 20px rgba(230,57,70,0.2)",
        "badge-split": "0 0 20px rgba(168,85,247,0.25)",
        "badge-compress": "0 0 20px rgba(59,130,246,0.25)",
        "badge-convert": "0 0 20px rgba(34,197,94,0.22)",
        "badge-edit": "0 0 20px rgba(249,115,22,0.22)",
      },
      backdropBlur: {
        glass: "20px",
        nav: "24px",
      },
      animation: {
        blob: "blob 8s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        progress: "progressShimmer 1.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fadeUp 0.4s ease-out forwards",
        "badge-dot": "badgeDot 0.28s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(20px,-20px) scale(1.05)" },
          "66%": { transform: "translate(-15px,15px) scale(0.97)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(230,57,70,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(230,57,70,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        badgeDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
