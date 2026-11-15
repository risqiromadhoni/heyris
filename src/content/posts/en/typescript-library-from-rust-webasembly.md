---
title: "Rust and WebAssembly for TypeScript engineers: what's the benefit?"
summary: "Rust through WebAssembly can help with the compute-heavy parts of an app, but not every project needs it."
date: 2024-12-02
updated: 2026-11-14
topic: rust
---

As a TypeScript engineer, you may wonder why Rust and WebAssembly (Wasm) come up so often in web development.

[The Rust Programming Language book](https://doc.rust-lang.org/book/ch00-00-introduction.html) says Rust helps you write faster, more reliable software. WebAssembly lets high-performance code run in the browser.

I updated this post in November 2026.

## 1. Performance

The idea that JavaScript is slow because it is interpreted is no longer accurate. The V8 engine, used by Chrome and Node.js, starts running code with the Ignition interpreter. Code that runs often is then compiled to machine code through Sparkplug, Maglev, and TurboFan or Turboshaft ([V8 documentation](https://github.com/v8/v8/blob/main/docs/overview.md)).

WebAssembly still has advantages. According to the [W3C announcement from 2019](https://www.w3.org/press-releases/2019/wasm/), much of its performance gain over JavaScript comes from consistent data types. WebAssembly also runs at close to native speed ([MDN guide to WebAssembly concepts](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts)).

The same announcement says WebAssembly can be used for video and audio codecs, graphics and 3D, multimedia and games, and cryptographic computing. The [Shopify Functions guide](https://shopify.dev/docs/apps/build/functions/programming-languages) recommends Rust for functions that target public apps, process many order items, or are compute-heavy. The same guide says JavaScript suits prototypes, but JavaScript functions reach Shopify's instruction limits sooner than Rust functions do.

## 2. Memory safety without a garbage collector

JavaScript manages memory automatically with a garbage collector ([MDN guide to memory management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management)). Rust does not use a garbage collector, but it still keeps memory safe. Its compiler checks the [ownership rules](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) before your program can run. Rust releases memory automatically when the variable that owns it goes out of scope.

Rust makes memory leaks hard to cause, but not impossible. The [reference cycles chapter](https://doc.rust-lang.org/book/ch15-06-reference-cycles.html) of the Rust book gives an example using `Rc<T>` and `RefCell<T>`.

In safe code, Rust has no null. A value that might be missing uses the `Option<T>` type, and the compiler forces you to handle the `None` case before you use the value. The [chapter on enums](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html) explains why.

Many concurrency errors in Rust are caught at compile time, not when the program runs ([concurrency chapter](https://doc.rust-lang.org/book/ch16-00-concurrency.html)). Borrowing rules can also prevent data races at compile time ([references and borrowing chapter](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)).

Rust reduces many of these bugs, but it does not remove them all.

## 3. Interoperability with JavaScript

Rust code can be compiled into a `.wasm` file and used in a TypeScript or JavaScript project. The bridge is `wasm-bindgen`. By default, this tool also generates TypeScript type definitions for the exports from Rust ([`wasm-bindgen` CLI reference](https://wasm-bindgen.github.io/wasm-bindgen/reference/cli.html)).

For a library, set `crate-type` to `cdylib` and add `wasm-bindgen` to `Cargo.toml`, as shown in the [`wasm-bindgen` hello world example](https://wasm-bindgen.github.io/wasm-bindgen/examples/hello-world.html).

```toml {title=Cargo.toml}
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

Without `cdylib`, `cargo build` for the Wasm target produces an `.rlib` file, not a `.wasm` file.

Add the Wasm target to your Rust toolchain, then compile the code:

```bash
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
```

The `.wasm` file from `cargo build` does not yet contain the JavaScript glue code or the TypeScript type definitions. The [`wasm-bindgen` CLI](https://wasm-bindgen.github.io/wasm-bindgen/reference/cli.html) generates both from that file.

For npm packages, use [`wasm-pack`](https://wasm-bindgen.github.io/wasm-pack/). The [`wasm-pack build`](https://wasm-bindgen.github.io/wasm-pack/book/commands/build.html) command compiles the code and generates the glue code in one step. `wasm-pack build --target bundler` produces an npm package for a bundler. Without `--target`, `wasm-pack` uses `bundler` by default.

The [`wasm-pack` repository](https://github.com/wasm-bindgen/wasm-pack) now lives in the `wasm-bindgen` GitHub organization. The old [`rustwasm`](https://github.com/rustwasm) organization has been archived. The [Rust blog](https://blog.rust-lang.org/inside-rust/2025/07/21/sunsetting-the-rustwasm-github-org/) announced the sunsetting of the rustwasm organization on July 21, 2025. When this post was updated, the latest release was v0.15.1 (October 30, 2026).

According to the [`wasm-bindgen` deployment guide](https://wasm-bindgen.github.io/wasm-bindgen/reference/deployment.html), webpack is the only bundler listed as fully supported. Rolldown also works through a plugin. Without a bundler, use `--target web`. That mode cannot use npm dependencies.

Outside the browser, Node.js can also run Wasm modules ([MDN guide to WebAssembly concepts](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts)). [Cloudflare Workers supports Rust](https://developers.cloudflare.com/workers/languages/rust/) through the `workers-rs` crate. Rust has the `wasm32-wasip2` target for WASI runtimes that support the component model. The `wasm32-wasip1` target is for compatibility with the older WASI preview 1. The same logic can run in the browser and on the server.

## 4. A better grasp of memory and concurrency

Learning Rust helps you understand low-level memory and concurrency concepts. You don't need to free memory by hand, but you do need to understand ownership and borrowing.

I think these concepts make you write more careful code, even if you don't write Rust every day.

## 5. Support and real-world use

Since November 2017, the four major browsers have supported WebAssembly, according to a [Mozilla announcement](https://blog.mozilla.org/press/2017/11/webassembly-support-now-shipping-in-all-major-browsers/).

Mozilla has used Rust in Firefox since Firefox 48 in 2016 ([Mozilla Hacks note](https://hacks.mozilla.org/2016/07/shipping-rust-in-firefox/)). Shopify Functions are compiled into WebAssembly modules ([Shopify Functions API reference](https://shopify.dev/docs/api/functions/latest)).

I don't know how quickly WebAssembly will evolve. Still, Rust and WebAssembly are already used in real products.

## Start small

Rust and WebAssembly do not replace TypeScript. Both are useful for small, compute-heavy parts of a project. Start with one function that you have measured and found slow. Move that function to Rust, then measure again.
