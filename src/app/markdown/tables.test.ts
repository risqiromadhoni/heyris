import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { describe, expect, it } from "vite-plus/test";

import { satteriOptions } from "./index";

const ID_FILE = new URL("file:///site/src/content/posts/id/contoh.md");
const EN_FILE = new URL("file:///site/src/content/posts/en/example.md");

const processor = await createSatteriMarkdownProcessor({
  ...satteriOptions,
  syntaxHighlight: false,
});

async function html(markdown: string, fileURL = ID_FILE): Promise<string> {
  const { code } = await processor.render(markdown, { fileURL });

  return code;
}

describe("tables", () => {
  const TABLE = "| Waktu | Kejadian |\n| :-- | --: |\n| 11.48 | `release-please` jalan |";

  it("frames a table in one focusable, labelled scroll region", async () => {
    const output = await html(TABLE);

    expect(output.match(/class="md-table"/g)).toHaveLength(1);
    expect(output.match(/<table>/g)).toHaveLength(1);
    expect(output).toContain('role="region"');
    expect(output).toContain('tabindex="0"');
    expect(output).toContain('aria-label="Tabel, bisa digulir"');
    expect(output.indexOf("md-table")).toBeLessThan(output.indexOf("<table>"));
  });

  it("frames each table of a document once", async () => {
    const output = await html(`${TABLE}\n\nTeks.\n\n${TABLE}`);

    expect(output.match(/class="md-table"/g)).toHaveLength(2);
    expect(output.match(/<table>/g)).toHaveLength(2);
  });

  it("labels the frame in English for English files", async () => {
    expect(await html(TABLE, EN_FILE)).toContain('aria-label="Table, scrollable"');
  });

  it("keeps the cell text, inline code and alignment", async () => {
    const output = await html(TABLE);

    expect(output).toContain("Waktu");
    expect(output).toContain("<code>release-please</code>");
    expect(output).toMatch(/<th[^>]*text-align: ?left[^>]*>Waktu/);
    expect(output).toMatch(/<th[^>]*text-align: ?right[^>]*>Kejadian/);
  });

  it("leaves a document without a table unchanged", async () => {
    expect(await html("Paragraf biasa.")).not.toContain("md-table");
  });
});
