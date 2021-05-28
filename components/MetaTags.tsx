import Head from "next/head";
import { TITLE_SUFFIX } from "../lib/constants";

export function MetaTitle({ title }: { title: string }) {
  const fullTitle = `${title} ${TITLE_SUFFIX}`;
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta property="og:title" content={fullTitle} />
      <meta property="twitter:title" content={fullTitle} />
    </Head>
  );
}
