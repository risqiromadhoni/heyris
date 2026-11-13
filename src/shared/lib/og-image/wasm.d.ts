// `?module` imports of a .wasm file, which the Cloudflare Vite plugin turns into a compiled module.
declare module "*.wasm?module" {
  const module: WebAssembly.Module;
  export default module;
}
