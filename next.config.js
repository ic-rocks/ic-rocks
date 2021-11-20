/* eslint-disable @typescript-eslint/no-var-requires */
const { API_ENDPOINT } = require("./config");

console.log("API_ENDPOINT:", API_ENDPOINT);

/**
 * Use webpack 4 for better Wasm support.
 * @dfinity/agent uses the export namespace proposal, so it must be transpiled with Babel. This is supported by default in Webpack 5, but must be done manually in 4.
 */
const withTM = require("next-transpile-modules")([
  "didc",
  "@dfinity/agent",
  "@dfinity/candid",
]);

module.exports = withTM({
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ENDPOINT}/:path*`,
      },
    ];
  },
});
