import { describe, expect, it } from "vite-plus/test";
import { bioFor } from "./bio";
import { bioSegments } from "./bio-links";

describe("bioSegments", () => {
  it.for([
    ["Dialog", "https://www.getdialog.io/?ref=heyris.me"],
    ["Yummy Corp", "https://www.yummycorp.com/?ref=heyris.me"],
    ["Virtual Spirit", "https://virtualspirit.me/?ref=heyris.me"],
  ] as const)("links %s to its site with the ref parameter", ([name, href]) => {
    expect(bioSegments(`I worked at ${name}.`)).toEqual([
      { kind: "text", text: "I worked at " },
      { kind: "company", text: name, href },
      { kind: "text", text: "." },
    ]);
  });

  it("turns the contact address into a mail link", () => {
    expect(bioSegments("email risqi@heyris.me.")).toEqual([
      { kind: "text", text: "email " },
      { kind: "mail", text: "risqi@heyris.me", href: "mailto:risqi@heyris.me" },
      { kind: "text", text: "." },
    ]);
  });

  it("leaves names inside longer words as text", () => {
    expect(bioSegments("the Yummyshop order system and a Dialogue")).toEqual([
      { kind: "text", text: "the Yummyshop order system and a Dialogue" },
    ]);
  });

  it("drops empty runs when a paragraph starts with a name", () => {
    expect(bioSegments("Dialog")).toEqual([
      { kind: "company", text: "Dialog", href: "https://www.getdialog.io/?ref=heyris.me" },
    ]);
  });

  it.for(["id", "en"] as const)("links all three companies in the %s short bio", (locale) => {
    const companies = bioFor(locale)
      .short.flatMap(bioSegments)
      .filter((segment) => segment.kind === "company")
      .map((segment) => segment.text);

    expect(companies).toEqual(["Dialog", "Virtual Spirit", "Yummy Corp"]);
  });
});
