import { ColorModeScript } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextDocument, { Head, Html, Main, NextScript } from "next/document";
import { chakraTheme } from "../chakra-theme";

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <ColorModeScript
            initialColorMode={chakraTheme.config.initialColorMode}
          />
          <Main />
          <NextScript />
          <Analytics />
          <SpeedInsights />
        </body>
      </Html>
    );
  }
}
