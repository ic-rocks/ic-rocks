export default function motoko(hljs) {
  const STRING = {
    className: "string",
    variants: [
      {
        begin: /r(#*)"(.|\n)*?"\1(?!#)/,
      },
      {
        begin: /b?'\\?(x\w{2}|u\w{4}|U\w{8}|.)'/,
      },
    ],
  };
  const NUMBER = {
    className: "number",
    variants: [
      {
        begin: "[+-]?\\b0[xX]([A-Fa-f0-9_]+)",
      },
      {
        begin: "[+-]?\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)",
      },
    ],
    relevance: 0,
  };
  return {
    name: "Motoko",
    aliases: ["mo"],
    keywords: {
      $pattern: "[a-zA-Z_]\\w*",
      keyword:
        "actor and await break case catch class" +
        " continue debug do else for func if in import" +
        " module not object or label let loop private" +
        " public return shared try throw query switch" +
        " type var while stable flexible system debug_show assert ignore",
      literal: "true false null",
      built_in:
        "Any None Null Bool Int Int8 Int16 Int32 Int64" +
        " Nat Nat8 Nat16 Nat32 Nat64 Word8 Word16 Word32 Word64" +
        " Float Char Text Blob Error Principal" +
        " async",
    },
    illegal: "</",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.COMMENT("/\\*", "\\*/", {
        contains: ["self"],
      }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null,
      }),
      STRING,
      NUMBER,
      {
        className: "symbol",
        begin: "#" + hljs.UNDERSCORE_IDENT_RE,
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "(\\(|<|=|{)",
        excludeEnd: true,
        contains: [hljs.UNDERSCORE_TITLE_MODE],
      },
      {
        className: "class",
        begin: "\\b(actor( class)?|module|object)\\b",
        keywords: "actor class module object",
        end: "(\\(|<|{)",
        contains: [hljs.UNDERSCORE_TITLE_MODE],
        illegal: "[\\w\\d]",
      },
      {
        className: "built_in",
        beginKeywords: "import type",
        end: "(;|$|=)",
        excludeEnd: true,
        contains: [
          hljs.QUOTE_STRING_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.COMMENT("/\\*", "\\*/", {
            contains: ["self"],
          }),
        ],
      },
    ],
  };
}
