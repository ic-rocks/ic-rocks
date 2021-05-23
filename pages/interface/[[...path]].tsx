import path from "path";
import fs from "fs";
import glob from "glob";
import { useRouter } from "next/router";
import Link from "next/link";
import ActiveLink from "../../components/ActiveLink";
import { useEffect, useState } from "react";
const didc = import("../../lib/didc-js/didc_js");

export async function getStaticPaths() {
  const base = `${process.cwd()}/interfaces`;
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
  const base = `${process.cwd()}/interfaces/${current}`;

  // If directory, list children. Otherwise, read .did file
  let file = null,
    children = null;
  if (fs.existsSync(base) && fs.lstatSync(base).isDirectory()) {
    children = glob
      .sync(`${base}/**/*.did`)
      .map((did) => path.relative(base, did).replace(/\.did$/, ""));
  } else {
    file = fs.readFileSync(`${base}.did`).toString();
  }

  return {
    props: {
      current,
      file,
      children,
    },
  };
}

const Interface = ({ current, file, children }) => {
  const router = useRouter();
  const [bindings, setBindings] = useState(null);
  const { path: path_ } = router.query;
  useEffect(() => {
    if (file) {
      didc.then((mod) => {
        const gen = mod.generate(file);
        setBindings(gen);
      });
    }
  }, [file]);

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
          activeClassName="text-black cursor-default"
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
          activeClassName="text-black cursor-default"
        >
          interfaces
        </ActiveLink>
        {title}
      </h1>
      {file ? (
        <div>
          <pre className="text-xs p-4 bg-gray-100 mt-4">{file}</pre>
          <pre className="text-xs p-4 bg-gray-100 mt-4">
            {bindings ? bindings.js : null}
          </pre>
          <pre className="text-xs p-4 bg-gray-100 mt-4">
            {bindings ? bindings.ts : null}
          </pre>
        </div>
      ) : (
        <ul>
          {children.map((child) => (
            <li key={child}>
              <Link href={`/interface${current ? "/" + current : ""}/${child}`}>
                <a className="hover:underline">{child}</a>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Interface;
