import classnames from "classnames";
import React, { useCallback, useState } from "react";
import { BsCheck, BsClipboard } from "react-icons/bs";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/cjs/languages/hljs/javascript";
import protobuf from "react-syntax-highlighter/dist/cjs/languages/hljs/protobuf";
import typescript from "react-syntax-highlighter/dist/cjs/languages/hljs/typescript";
import { monokai } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { useClipboard } from "use-clipboard-copy";
import { Bindings } from "../lib/didc-js/didc_js";
import candid from "../lib/syntax/candid";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("candid", candid);
SyntaxHighlighter.registerLanguage("protobuf", protobuf);

const LANGUAGES = ["candid", "javascript", "typescript", "protobuf"] as const;

export default function CodeBlock({
  className,
  candid,
  bindings,
  protobuf,
}: {
  className?: string;
  candid: string;
  bindings: Bindings | null;
  protobuf: string;
}) {
  const [language, setLanguage] = useState<typeof LANGUAGES[number]>(
    candid ? "candid" : "protobuf"
  );

  const displayCode =
    language === "candid"
      ? candid
      : language === "javascript"
      ? bindings.js || ""
      : language === "typescript"
      ? bindings.ts || ""
      : protobuf;

  const clipboard = useClipboard({
    copiedTimeout: 1000,
  });
  const handleCopy = useCallback(
    () => clipboard.copy(displayCode),
    [clipboard.copy, displayCode]
  );

  return (
    <div className={className}>
      <div className="flex divide-x divide-gray-100 dark:divide-gray-900">
        {LANGUAGES.map((lang) => {
          const disabled =
            (lang === "protobuf" && !protobuf) ||
            (lang !== "protobuf" && !candid);
          return (
            <button
              key={lang}
              className={classnames(
                "px-3 py-1 focus:outline-none transition-200 transition-colors",
                {
                  "text-gray-300 dark:text-gray-700 cursor-not-allowed":
                    disabled,
                  "hover:bg-gray-300 dark:hover:bg-gray-700":
                    !disabled && lang !== language,
                  "bg-gray-200 dark:bg-gray-800": lang !== language,
                  "bg-gray-400 dark:bg-gray-600": lang === language,
                }
              )}
              onClick={() => setLanguage(lang)}
              disabled={disabled}
            >
              {lang}
            </button>
          );
        })}
      </div>
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
