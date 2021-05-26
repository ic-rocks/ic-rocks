import Head from "next/head";
import React from "react";
import { TITLE_SUFFIX } from "../lib/constants";

export default function Search404({ input }) {
  return (
    <div className="py-16">
      <Head>
        <title>Not Found {TITLE_SUFFIX}</title>
      </Head>
      <h1 className="text-3xl mb-8">Not found</h1>
      <p>You searched for: {input}</p>
    </div>
  );
}
