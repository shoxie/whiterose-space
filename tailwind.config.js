/** @type {import('tailwindcss').Config} */

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

let themeColors = {
  base: withOpacityValue("--color-base"),
  surface: withOpacityValue("--color-surface"),
  text: withOpacityValue("--color-text"),
  subtle: withOpacityValue("--color-subtle"),
  muted: withOpacityValue("--color-muted"),
  pine: withOpacityValue("--color-pine"),
  iris: withOpacityValue("--color-iris"),
  highlightLow: withOpacityValue("--color-highlight-low"),
  highlightHigh: withOpacityValue("--color-highlight-high"),
  love: withOpacityValue("--color-love"),
  overlay: withOpacityValue("--color-overlay"),
};

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./data/**/*.mdx"],
  theme: {
    extend: {
      colors: themeColors,
      fontFamily: {
        display: ['"Noto Serif JP"', 'serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.text"),
            "--tw-prose-headings": theme("colors.pine"),
            "--tw-prose-links": theme("colors.highlightLow"),
            "--tw-prose-pre-bg": theme("colors.overlay"),
            "--tw-prose-code": theme("colors.text"),
            "--tw-prose-pre-code": theme("colors.text"),
            "--tw-prose-bold": theme("colors.love"),
          },
          code: {
            color: theme("colors.iris"),
            background: theme("colors.overlay"),
            padding: "0.25rem 0.4rem",
            borderRadius: "0.375rem",
            fontWeight: "600",
          },
          "code::before": {
            content: '""',
          },
          "code::after": {
            content: '""',
          },
        },
        xl: {
          css: {
            "--tw-prose-body": theme("colors.text"),
            "--tw-prose-headings": theme("colors.pine"),
            "--tw-prose-links": theme("colors.highlightLow"),
            "--tw-prose-pre-bg": theme("colors.overlay"),
            "--tw-prose-code": theme("colors.text"),
            "--tw-prose-pre-code": theme("colors.text"),
            "--tw-prose-bold": theme("colors.love"),
          },
          code: {
            color: theme("colors.iris"),
            background: theme("colors.overlay"),
            padding: "0.25rem 0.4rem",
            borderRadius: "0.375rem",
            fontWeight: "600",
          },
          "code::before": {
            content: '""',
          },
          "code::after": {
            content: '""',
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
