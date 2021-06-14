import Document, { Head, Html, Main, NextScript } from "next/document";

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
        <body className="dark:bg-gray-900 dark:text-white">
          <script src="/noflash.js" />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
