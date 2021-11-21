import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="icon"
            type="image/png"
            href="https://ic.rocks/img/icrocks-logo.png"
          />
          <meta property="og:type" content="website" />
        </Head>
        <body className="dark:text-white dark:bg-gray-900">
          <script src="/noflash.js" />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
