"use client";

import { Layout } from "@/components";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps /*, AppContext */ } from "next/app";
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
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <SWRConfig value={swr_config_options}>
          <Layout title="PHORM - Prince Hall Online Registry of Merchants">
            <Component {...pageProps} />
            <Analytics />
            <SpeedInsights />
          </Layout>
        </SWRConfig>
      </AuthProvider>
    </ChakraProvider>
  );
}
