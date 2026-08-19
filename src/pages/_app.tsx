import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { DefaultSeo } from "next-seo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";

function MyApp({
  Component,
  pageProps,
  router,
}: AppProps & { Component: { Layout?: any } }) {
  const reduced = useReducedMotion();

  function DefaultLayout({ children }: { children: React.ReactNode }) {
    return children;
  }

  const Layout = Component.Layout || DefaultLayout;
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="moon"
      themes={["moon", "dawn"]}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={router.asPath}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Layout>
            <DefaultSeo
              defaultTitle="WhiteRose Space"
              titleTemplate={`%s - WhiteRose Space`}
              description="Blog của một cựu web developer, giờ là ServiceNow developer. Viết về code và những thứ linh tinh."
              robotsProps={{
                nosnippet: true,
                notranslate: true,
                noimageindex: true,
                noarchive: true,
                maxSnippet: -1,
                maxImagePreview: "none",
                maxVideoPreview: -1,
              }}
              additionalLinkTags={[
                {
                  rel: "apple-touch-icon",
                  sizes: "76x76",
                  href: "/static/favicon/apple-touch-icon.png",
                },
                {
                  rel: "icon",
                  sizes: "32x32",
                  type: "image/png",
                  href: "/static/favicon/favicon-32x32.png",
                },
                {
                  rel: "icon",
                  sizes: "16x16",
                  type: "image/png",
                  href: "/static/favicon/favicon-16x16.png",
                },
                {
                  rel: "manifest",
                  href: "/static/favicon/manifest.json",
                },
                {
                  rel: "mask-icon",
                  href: "/static/favicon/safari-pinned-tab.svg",
                  color: "#E11D2E",
                },
                {
                  rel: "alternate",
                  type: "application/rss+xml",
                  href: "/feed.xml",
                },
              ]}
              openGraph={{
                type: "website",
                locale: "en_US",
                url: "https://wrosedev.tech",
                site_name: "WhiteRose Space",
                profile: {
                  firstName: "Đào",
                  lastName: "Tuấn Anh",
                  username: "whiterose.uchiha",
                  gender: "male",
                },
                images: [
                  {
                    url: "https://wrosedev.tech/static/images/socialbanner.png",
                    alt: "WhiteRose Space",
                  },
                ],
              }}
              facebook={{
                appId: "451524752582846",
              }}
            />
            <Component {...pageProps} key={router.route} />
            <Analytics />
          </Layout>
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default MyApp;
