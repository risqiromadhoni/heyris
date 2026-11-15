import { describe, expect, it } from "vite-plus/test";

import { markdownDocument, updatedField, yamlString } from "./markdown-document";

describe("markdownDocument", () => {
  it("writes the frontmatter, a blank line, then the body", () => {
    const document = markdownDocument(
      [
        ["title", yamlString("Retry dengan Schedule")],
        ["date", "2026-11-12"],
      ],
      "Isi catatan.\n",
    );

    expect(document).toBe(
      '---\ntitle: "Retry dengan Schedule"\ndate: 2026-11-12\n---\n\nIsi catatan.\n',
    );
  });

  it("ends the body with exactly one newline", () => {
    expect(markdownDocument([], "Tanpa baris baru")).toBe("---\n\n---\n\nTanpa baris baru\n");
  });
});

describe("yamlString", () => {
  it("escapes quotes for YAML", () => {
    expect(yamlString('Kata "kutip": ya')).toBe('"Kata \\"kutip\\": ya"');
  });
});

describe("updatedField", () => {
  it("lists the dates oldest first", () => {
    const dates = [new Date("2026-11-14T00:00:00Z"), new Date("2025-03-02T00:00:00Z")];

    expect(updatedField(dates)).toEqual([["updated", "[2025-03-02, 2026-11-14]"]]);
  });

  it("writes no field for an entry never updated", () => {
    expect(updatedField([])).toEqual([]);
  });
});
