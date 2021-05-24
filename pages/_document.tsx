import Document, { Head, Html, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" type="image/png" href="/cubes.png" />
          <meta name="title" content="Internet Computer Tools" />
          <meta
            name="description"
            content="A collection of tools for the DFINITY Internet Computer."
          />
          <meta property="og:image" content="/cubes.png" />
        </Head>
        <body className="dark:bg-gray-900 dark:text-white">
          <script src="noflash.js" />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
