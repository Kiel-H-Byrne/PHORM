import { Layout } from "@/components";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps /*, AppContext */ } from "next/app";
import Head from "next/head";
import { SWRConfig } from "swr";
import { BRAND_THEME } from "../util/constants";
import fetcher from "../util/fetch";

const swr_config_options = {
  refreshInterval: 0,
  shouldRetryOnError: false,
  fetcher: fetcher,
};

const theme = extendTheme(BRAND_THEME);
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <SWRConfig value={swr_config_options}>
          <Layout>
            <Head>
              <meta charSet="utf-8" />

              <meta
                name="viewport"
                // content="width=device-width, initial-scale=0.86, maximum-scale=1, minimum-scale=0.86"
                content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui"
              />
              <meta name="format-detection" content="telephone=no" />
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

              <meta name="HandheldFriendly" content="true" />
              <meta name="mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta
                name="apple-mobile-web-app-status-bar-style"
                content="black"
              />
              <meta name="apple-mobile-web-app-title" content="The PHORM" />
              <title>PHORM - Prince Hall Online Registry of Merchants</title>

              <meta
                property="og:title"
                content="The PHORM: Prince Hall Online Registry of Merchants"
              />
              <meta property="og:type" content="website" />
              <meta
                property="og:image"
                content="https://phorm.kielbyrne.com/img/Logo_TWPx1024.jpg"
              />
              <meta
                property="og:image:secure_url"
                content="https://phorm.kielbyrne.com/img/Logo_TWPx1024.jpg"
              />
              <meta property="og:image:type" content="image/jpeg" />
              <meta property="og:image:width" content="1024" />
              <meta property="og:image:height" content="1024" />
              <meta property="og:image:alt" content="The PHORM.com Logo" />
              <meta property="og:url" content="https://phorm.kielbyrne.com" />
              <meta
                property="og:description"
                content="Real Investment Decisions by Real People"
              />
              <meta property="og:determiner" content="the" />
              <meta property="og:locale" content="en_US" />
              <meta property="og:site_name" content="PHORM" />
              {/* <meta property="fb:app_id" content="235091633613282" />
<meta
  name="google-site-verification"
  content="OJEUZfTeTwEUiclFV1wP8-_pr29LuzIbx1ldaX5jdK4"
/> */}
              <meta
                name="google-signin-client_id"
                content={process.env.NEXT_PUBLIC_TEST_client_id}
              />
              <meta
                name="google-signin-cookiepolicy"
                content="single_host_origin"
              />
              <meta name="google-signin-scope" content="profile email" />

              <meta name="theme-color" content="#edf2ff" />
              <meta name="msapplication-config" content="/browserconfig.xml" />
              <meta name="msapplication-TileColor" content="#edf2ff" />
              <meta
                name="msapplication-TileImage"
                content="/img/icons/mstile-144x144.png"
              />
              <link
                rel="manifest"
                type="application/manifest+json"
                href="/app_manifest.json"
              />

              <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/img/icons/favicon-32x32.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/img/icons/favicon-16x16.png"
              />
              <link
                rel="apple-touch-icon"
                href="/img/icons/apple-touch-icon.png"
              />
              <link rel="apple-touch-startup-image" href="/img/Logo_TWP.jpg" />
              <link
                rel="mask-icon"
                href="/img/icons/safari-pinned-tab.svg"
                color="#edf2ff"
              />
            </Head>
            <Component {...pageProps} />
            <Analytics />
            <SpeedInsights />
          </Layout>
        </SWRConfig>
      </ChakraProvider>
    </SessionProvider>
  );
}
