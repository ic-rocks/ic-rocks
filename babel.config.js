module.exports = {
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          exclude: ["transform-exponentiation-operator"], // keep BigInt ** BigInt
        },
      },
    ],
  ],
  plugins: [],
};
