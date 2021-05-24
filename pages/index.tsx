import Head from "next/head";
import { DESCRIPTION, TITLE_SUFFIX } from "../lib/constants";

export default function Home() {
  return (
    <div className="py-16">
      <Head>
        <title>Home {TITLE_SUFFIX}</title>
      </Head>
      <h1 className="text-3xl mb-16">Internet Computer Tools</h1>
      <p>{DESCRIPTION}</p>
    </div>
  );
}
