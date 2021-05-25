import Document, { Head, Html, Main, NextScript } from "next/document";
import { DESCRIPTION, TITLE } from "../lib/constants";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" type="image/png" href="/cubes.png" />
          <meta name="title" content={TITLE} />
          <meta name="description" content={DESCRIPTION} />
          <meta property="og:title" content={TITLE} />
          <meta property="og:description" content={DESCRIPTION} />
          <meta property="og:image" content="/cubes.png" />
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
