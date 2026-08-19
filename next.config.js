const { withContentlayer } = require("next-contentlayer");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  i18n: {
    locales: ["vi"],
    defaultLocale: "vi",
  },
  ...(process.env.BUILD_STANDALONE === "true" && { output: "standalone" }),
};

module.exports = withBundleAnalyzer(withContentlayer(nextConfig));