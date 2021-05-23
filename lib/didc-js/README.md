# didc-js

A JS/Wasm package for generating Candid bindings.

## Building

```shell
cargo install wasm-opt
wasm-pack build --target bundler
ic-cdk-optimizer pkg/didc_js_bg.wasm -o pkg/didc_js_bg.wasm
```
