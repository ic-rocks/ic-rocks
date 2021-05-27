import Document, { Head, Html, Main, NextScript } from "next/document";
import { DESCRIPTION } from "../lib/constants";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" type="image/png" href="/img/icrocks-logo.png" />
          <meta name="description" content={DESCRIPTION} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={DESCRIPTION} />
          <meta property="og:image" content="/img/icrocks-hero.png" />

          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:description" content={DESCRIPTION} />
          <meta property="twitter:image" content="/img/icrocks-hero.png" />
        </Head>
        <body className="dark:bg-gray-900 dark:text-white">
          <script src="/noflash.js" />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
