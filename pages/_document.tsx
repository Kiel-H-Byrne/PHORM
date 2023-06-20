import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import { ColorModeScript } from "@chakra-ui/react";
import { chakraTheme } from "../chakra-theme";

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head></Head>
        <body>
          <ColorModeScript
            initialColorMode={chakraTheme.config.initialColorMode}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
