import { Layout } from "@/components";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
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
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <SWRConfig value={swr_config_options}>
          <Layout>
            <Component {...pageProps} />
            <Analytics />
            <SpeedInsights />
          </Layout>
        </SWRConfig>
      </ChakraProvider>
    </SessionProvider>
  );
}
