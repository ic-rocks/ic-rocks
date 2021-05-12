const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const dfxJson = require("./dfx.json");

const isDevelopment = process.env.NODE_ENV === "development";

function generateWebpackConfigForCanister(name, info) {
  if (typeof info.frontend !== "object") {
    return;
  }

  return {
    mode: isDevelopment ? "development" : "production",
    entry: {
      // The frontend.entrypoint points to the HTML file for this build, so we need
      // to replace the extension to `.js`.
      index: path
        .join(__dirname, info.frontend.entrypoint)
        .replace(/\.html$/, ".js"),
    },
    devtool: isDevelopment ? "cheap-module-source-map" : false,
    optimization: {
      minimize: !isDevelopment,
      minimizer: [new TerserPlugin()],
    },
    resolve: {
      extensions: [".js", ".ts", ".jsx", ".tsx"],
      fallback: {
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        events: require.resolve("events/"),
        stream: require.resolve("stream-browserify/"),
        util: require.resolve("util/"),
      },
    },
    output: {
      filename: "[name].js",
      path: path.join(__dirname, "dist", name),
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: ["postcss-preset-env", require("tailwindcss")],
                },
              },
            },
          ],
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
          loader: "url-loader",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, info.frontend.entrypoint),
        filename: "index.html",
        chunks: ["index"],
      }),
      new webpack.ProvidePlugin({
        Buffer: [require.resolve("buffer/"), "Buffer"],
        process: require.resolve("process/browser"),
      }),
    ],
    devServer: {
      hot: true,
    },
  };
}

// If you have additional webpack configurations you want to build
//  as part of this configuration, add them to the section below.
module.exports = [
  ...Object.entries(dfxJson.canisters)
    .map(([name, info]) => {
      return generateWebpackConfigForCanister(name, info);
    })
    .filter((x) => !!x),
];
