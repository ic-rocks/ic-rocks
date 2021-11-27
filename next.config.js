const { API_ENDPOINT } = require("./config");

console.log("API_ENDPOINT:", API_ENDPOINT);

module.exports = {
  webpack(config) {
    // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
    config.experiments = { asyncWebAssembly: true };

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ENDPOINT}/:path*`,
      },
    ];
  },
};
