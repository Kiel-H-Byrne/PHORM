import Head from "next/head";
import { SITE_DESCRIPTION, SITE_URL } from "@/util/constants";
import { memo } from "react";

interface Props {
  title: string;
}

const CustomHead = ({ title }: Props) => {
  return (
    <Head>
      <title key="title">{title}</title>
      <meta charSet="utf-8" />

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      <meta name="HandheldFriendly" content="true" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="PHORM" />

      <meta property="og:title" content={title} key="og:title" />
      <meta property="og:type" content="website" key="og:type" />
      {SITE_URL && (
        <meta
          property="og:image"
          content={`${SITE_URL}/img/Logo1.png`}
          key="og:image"
        />
      )}
      <meta name="description" content={SITE_DESCRIPTION} key="description" />
      <meta
        property="og:description"
        content={SITE_DESCRIPTION}
        key="og:description"
      />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="PHORM" />

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
      <link rel="apple-touch-icon" href="/img/icons/apple-touch-icon.png" />
      <link rel="apple-touch-startup-image" href="/img/Logo_TWP.jpg" />
      <link
        rel="mask-icon"
        href="/img/icons/safari-pinned-tab.svg"
        color="#edf2ff"
      />
    </Head>
  );
};
export default memo(CustomHead);
