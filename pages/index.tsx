import Head from "next/head";

export default function Home() {
  return (
    <div className="py-16">
      <Head>
        <title>Home | IC Tools</title>
      </Head>
      <h1 className="text-3xl mb-16">Internet Computer Tools</h1>
      <p>A collection of tools for the DFINITY Internet Computer.</p>
    </div>
  );
}
