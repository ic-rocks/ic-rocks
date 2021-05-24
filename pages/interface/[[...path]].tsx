import classnames from "classnames";
import path from "path";
import fs from "fs";
import glob from "glob";
import { useRouter } from "next/router";
import Link from "next/link";
import ActiveLink from "../../components/ActiveLink";
import { useEffect, useState } from "react";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import classNames from "classnames";
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);

const didc = import("../../lib/didc-js/didc_js");

export async function getStaticPaths() {
  const base = `${process.cwd()}/public/interfaces`;
  const paths = glob
    .sync(`${base}/**/*.did`)
    .concat(glob.sync(`${base}/**/*/`))
    .map((did) => ({
      params: {
        path: path
          .relative(base, did)
          .replace(/\.did$/, "")
          .split("/"),
      },
    }))
    .concat([{ params: { path: null } }]); // root path

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { path: path_ = "" } }) {
  const current = (typeof path_ === "string" ? [path_] : path_).join("/");
  const base = `${process.cwd()}/public/interfaces/${current}`;

  // If directory, list children
  let children = null;
  if (fs.existsSync(base) && fs.lstatSync(base).isDirectory()) {
    children = glob
      .sync(`${base}/**/*.did`)
      .map((did) => path.relative(base, did).replace(/\.did$/, ""));
  }

  return {
    props: {
      current,
      children,
    },
  };
}

const LANGUAGES = ["candid", "javascript", "typescript"];

const Interface = ({ current, children }) => {
  const router = useRouter();
  const [file, setFile] = useState("");
  const [bindings, setBindings] = useState(null);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const { path: path_ } = router.query;

  useEffect(() => {
    if (current) {
      fetch(`/interfaces/${current}.did`)
        .then((res) => res.text())
        .then((data) => {
          setFile(data);
          didc.then((mod) => {
            const gen = mod.generate(data);
            setBindings(gen);
          });
        })
        .catch(console.error);
    } else {
      setFile("");
    }
  }, [current]);

  let title;
  if (path_) {
    let joined = "";
    title = (typeof path_ === "string" ? [path_] : path_).map((part, i) => {
      joined += `/${part}`;
      return [
        <span key={i} className="px-1">
          /
        </span>,
        <ActiveLink
          key={joined}
          href={`/interface${joined}`}
          linkClassName="text-blue-600 hover:underline"
          activeClassName="cursor-default"
        >
          {part}
        </ActiveLink>,
      ];
    });
  }

  return (
    <div className="py-16">
      <h1 className="text-3xl mb-8">
        <ActiveLink
          href="/interface"
          linkClassName="text-blue-600 hover:underline"
          activeClassName="cursor-default"
        >
          interfaces
        </ActiveLink>
        {title}
      </h1>
      {children ? (
        <ul>
          {children.map((child) => (
            <li key={child}>
              <Link href={`/interface${current ? "/" + current : ""}/${child}`}>
                <a className="hover:underline">{child}</a>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <ul className="flex">
            {LANGUAGES.map((lang) => (
              <li key={lang}>
                <button
                  className={classnames(
                    "px-3 py-1 focus:outline-none transition-200 transition-colors",
                    {
                      "bg-gray-200 dark:bg-gray-800": lang !== language,
                      "bg-gray-300 dark:bg-gray-600": lang === language,
                    }
                  )}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </button>
              </li>
            ))}
          </ul>
          <SyntaxHighlighter
            language={language}
            style={{ ...coldarkDark, marginTop: 0 }}
          >
            {language === "candid"
              ? file
              : language === "javascript"
              ? bindings.js || ""
              : bindings.ts || ""}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default Interface;
