import classnames from "classnames";
import React, { useCallback, useState } from "react";
import { BsCheck, BsClipboard } from "react-icons/bs";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/cjs/languages/hljs/javascript";
import typescript from "react-syntax-highlighter/dist/cjs/languages/hljs/typescript";
import { monokai } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { useClipboard } from "use-clipboard-copy";
import { Bindings } from "../lib/didc-js/didc_js";
import candid from "../lib/syntax/candid";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("candid", candid);

const LANGUAGES = ["candid", "javascript", "typescript"];

export default function CodeBlock({
  className,
  candid,
  bindings,
}: {
  className?: string;
  candid: string;
  bindings: Bindings | null;
}) {
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const displayCode =
    language === "candid"
      ? candid
      : language === "javascript"
      ? bindings.js || ""
      : bindings.ts || "";

  const clipboard = useClipboard({
    copiedTimeout: 1000,
  });
  const handleCopy = useCallback(
    () => clipboard.copy(displayCode),
    [clipboard.copy, displayCode]
  );

  return (
    <div className={className}>
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
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 z-10 p-2 bg-gray-600 text-gray-400 fill-current focus:outline-none rounded border border-gray-400 border-0.5"
        >
          {clipboard.copied ? <BsCheck /> : <BsClipboard />}
        </button>
        <SyntaxHighlighter
          language={language}
          className="text-sm"
          customStyle={{ marginTop: 0 }}
          style={monokai}
        >
          {displayCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
