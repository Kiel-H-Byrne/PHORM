import React from "react";
import Head from "next/head";

interface Props {
  title: string
}

export const CustomHead = ({ title }: Props) => {

  return (
    <Head>
      <title>{title}</title>
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
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="This Weeks Plays" />

      <meta property="og:title" content="This Weeks Plays" />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content="https://thisweeksplays.kielbyrne.com/img/Logo_TWPx1024.jpg"
      />
      <meta
        property="og:image:secure_url"
        content="https://thisweeksplays.kielbyrne.com/img/Logo_TWPx1024.jpg"
      />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1024" />
      <meta property="og:image:height" content="1024" />
      <meta property="og:image:alt" content="The TWP.com Logo" />
      <meta property="og:url" content="https://thisweeksplays.kielbyrne.com" />
      <meta
        property="og:description"
        content="Real Investment Decisions by Real People"
      />
      <meta property="og:determiner" content="the" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="This Weeks Plays" />
      <meta property="fb:app_id" content="235091633613282" />
      <meta
        name="google-site-verification"
        content="OJEUZfTeTwEUiclFV1wP8-_pr29LuzIbx1ldaX5jdK4"
      />

      <meta name="theme-color" content="#9BA17B" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#9BA17B" />
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
        href="/img/icons/apple-touch-icon-180x180.png"
      />
      <link rel="apple-touch-startup-image" href="/img/Logo_TWP.jpg" />
      <link
        rel="mask-icon"
        href="/img/icons/safari-pinned-tab.svg"
        color="#9BA17B"
      />
<link href="https://unpkg.com/video.js/dist/video-js.min.css" rel="stylesheet" />
<script src="https://unpkg.com/video.js/dist/video.min.js" />

    </Head>
  );
};
