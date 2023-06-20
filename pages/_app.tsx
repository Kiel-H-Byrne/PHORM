import type { AppProps /*, AppContext */ } from "next/app";
import React from "react";
import Head from "next/head";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Provider } from "next-auth/client";
import { SWRConfig } from "swr";
import fetcher from "../util/fetch";
import { BRAND_THEME } from '../util/constants'

const swr_config_options = {
  refreshInterval: 0,
  shouldRetryOnError: false,
  fetcher: fetcher,
};

const theme = extendTheme(
  BRAND_THEME
)
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <Head>
          <title>Top 5 Plays</title>
        </Head>
        <SWRConfig value={swr_config_options}>
        <Component {...pageProps} />
        </SWRConfig>
      </ChakraProvider>
    </Provider>
  );
}