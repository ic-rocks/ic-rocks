/**
 * Use webpack 4 for better Wasm support.
 * @dfinity/agent uses the export namespace proposal, so it must be transpiled with Babel. This is supported by default in Webpack 5, but must be done manually in 4.
 */
const withTM = require("next-transpile-modules")([
  "didc",
  "@dfinity/agent",
  "@dfinity/candid",
]);

const API_ENDPOINT = process.env.API_ENDPOINT || "http://api.ic.rocks";
console.log("API_ENDPOINT:", API_ENDPOINT);

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
