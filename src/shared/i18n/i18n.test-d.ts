import { describe, expectTypeOf, it } from "vite-plus/test";

import { en } from "./en";
import type { Dictionary } from "./id";
import { counterpartPath, dictionaryFor, localizedPath } from "./index";
import type { Locale } from "./index";

describe("locales", () => {
  it("are Indonesian and English only", () => {
    expectTypeOf<Locale>().toEqualTypeOf<"id" | "en">();
  });
});

describe("localizedPath", () => {
  it("takes a site locale and returns a path", () => {
    expectTypeOf(localizedPath).parameter(0).toEqualTypeOf<Locale>();
    expectTypeOf(localizedPath).returns.toEqualTypeOf<string>();
  });

  it("rejects an unknown locale or route name", () => {
    // @ts-expect-error French is not a site locale.
    localizedPath("fr", "home");

    // @ts-expect-error There is no `about` route.
    localizedPath("id", "about");
  });
});

describe("counterpartPath", () => {
  it("may return undefined", () => {
    expectTypeOf(counterpartPath).returns.toEqualTypeOf<string | undefined>();
  });
});

describe("dictionaries", () => {
  it("match English to the Indonesian keys", () => {
    expectTypeOf(en).toEqualTypeOf<Dictionary>();
    expectTypeOf(dictionaryFor).returns.toEqualTypeOf<Dictionary>();
  });

  it("keep counted strings as number functions", () => {
    expectTypeOf<Dictionary["notes"]["count"]>().toEqualTypeOf<(n: number) => string>();
    expectTypeOf<Dictionary["copy"]["openIn"]>().parameters.toEqualTypeOf<[service: string]>();
  });
});
