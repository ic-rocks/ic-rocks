/**
 * Use webpack 4 for better Wasm support.
 * @dfinity/agent uses the export namespace proposal, so it must be transpiled with Babel. This is supported by default in Webpack 5, but must be done manually in 4.
 */
const withTM = require("next-transpile-modules")(["@dfinity/agent"]);

module.exports = withTM();
