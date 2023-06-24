import { ChakraProvider, extendTheme } from "@chakra-ui/react";
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
          <Head>
            <title>PHORM - Prince Hall Online Registry of Merchants</title>
          </Head>
          <SWRConfig value={swr_config_options}>
            <Component {...pageProps} />
          </SWRConfig>
        </ChakraProvider>
    </SessionProvider>
  );
}
