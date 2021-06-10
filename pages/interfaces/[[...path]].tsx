import fs from "fs";
import glob from "glob";
import Link from "next/link";
import { useRouter } from "next/router";
import path from "path";
import React, { useEffect, useState } from "react";
import { BiPencil } from "react-icons/bi";
import { FiFilePlus } from "react-icons/fi";
import ActiveLink from "../../components/ActiveLink";
import CandidAttach from "../../components/CandidAttach";
import CodeBlock from "../../components/CodeBlock";
import MatchingCanistersList from "../../components/MatchingCanistersList";
import { MetaTitle } from "../../components/MetaTags";
import { SecondaryNav } from "../../components/SecondaryNav";
import { GITHUB_REPO } from "../../lib/constants";

const didc = import("didc");

export async function getStaticPaths() {
  const base = `${process.cwd()}/public/data/interfaces`;
  const paths = glob
    .sync(`${base}/**/*`)
    .concat(glob.sync(`${base}/**/*/`))
    .map((file) => ({
      params: {
        path: path.relative(base, file).split("/"),
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
  const base = `${process.cwd()}/public/data/interfaces/${current}`;

  // If directory, list children
  let children = null;
  if (fs.existsSync(base) && fs.lstatSync(base).isDirectory()) {
    children = glob
      .sync(`${base}/**/*.*`)
      .map((file) => path.relative(base, file));
  }

  return {
    props: {
      current,
      children,
    },
  };
}

const Interfaces = ({ current, children }) => {
  const router = useRouter();
  const [canisters, setCanisters] = useState({});
  const [matches, setMatches] = useState([]);
  const [candid, setCandid] = useState("");
  const [protobuf, setProtobuf] = useState("");
  const [bindings, setBindings] = useState(null);
  const { path: path_ } = router.query;

  useEffect(() => {
    if (current) {
      fetch(`/data/interfaces/${current}`)
        .then((res) => res.text())
        .then((data) => {
          if (current.endsWith(".did")) {
            setCandid(data);
            didc.then((mod) => {
              const gen = mod.generate(data);
              setBindings(gen);
            });
          } else {
            setProtobuf(data);
          }
        })
        .catch(console.error);
    } else {
      setCandid("");
      setProtobuf("");
    }
  }, [current]);

  useEffect(() => {
    fetch("/data/json/canisters.json")
      .then((res) => res.json())
      .then((json) => {
        setCanisters(json);
      });
  }, []);

  useEffect(() => {
    if (current) {
      const basename = current.replace(/\.\w+/, "");
      const keys = Object.keys(canisters);
      if (keys.length) {
        setMatches(keys.filter((key) => canisters[key] === basename));
      }
    } else {
      setMatches([]);
    }
  }, [current, canisters]);

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
          href={`/interfaces${joined}`}
          linkClassName="text-blue-600 hover:underline"
          activeClassName="cursor-default"
        >
          {part}
        </ActiveLink>,
      ];
    });
  }

  return (
    <div className="pb-16">
      <MetaTitle title={`interfaces${current ? "/" + current : ""}`} />
      <SecondaryNav
        items={[
          <ActiveLink href="/canisters">Canisters</ActiveLink>,
          <ActiveLink href="/interfaces">Interfaces</ActiveLink>,
        ]}
      />
      <h1 className="text-3xl mb-8">
        <ActiveLink
          href="/interfaces"
          linkClassName="text-blue-600 hover:underline"
          activeClassName="cursor-default"
        >
          interfaces
        </ActiveLink>
        {title}
      </h1>
      {children ? (
        <section>
          <ul className="mb-8 divide-y divide-gray-200 dark:divide-gray-800">
            {children.map((child) => (
              <li key={child}>
                <Link
                  href={`/interfaces${current ? "/" + current : ""}/${child}`}
                >
                  <a className="hover:underline text-blue-600">{child}</a>
                </Link>
              </li>
            ))}
          </ul>
          <a
            className="inline-flex items-center text-blue-600 hover:underline"
            href={`${GITHUB_REPO}/new/main/public/data/interfaces/${current}?filename=newfile.did&value=%2F%2F%20Candid%20file%20here`}
            target="_blank"
          >
            <FiFilePlus className="mr-0.5" />
            Add new interface...
          </a>
        </section>
      ) : (
        <>
          <MatchingCanistersList canisterIds={matches} />
          {candid && <CandidAttach candid={candid} />}
          <CodeBlock
            key={candid}
            candid={candid}
            bindings={bindings}
            className="mb-8"
            protobuf={protobuf}
          />
          <a
            className="inline-flex items-center text-blue-600 hover:underline"
            href={`${GITHUB_REPO}/edit/main/public/data/interfaces/${current}`}
            target="_blank"
          >
            <BiPencil className="mr-0.5" /> Edit {current}
          </a>
        </>
      )}
    </div>
  );
};

export default Interfaces;
