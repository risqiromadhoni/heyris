import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { describe, expect, it } from "vite-plus/test";

import { satteriOptions } from "./index";

const ID_FILE = new URL("file:///site/src/content/posts/id/contoh.md");

const processor = await createSatteriMarkdownProcessor({
  ...satteriOptions,
  syntaxHighlight: false,
});

async function html(markdown: string, fileURL = ID_FILE): Promise<string> {
  const { code } = await processor.render(markdown, { fileURL });

  return code;
}

describe("checklists", () => {
  it("splits checklist items into label and detail", async () => {
    const output = await html(":::checklist\n- Cepat: semua halaman prerender\n:::");

    expect(output).toContain("md-checklist__icon i-ph-check-circle-fill");
    expect(output).toContain(
      '<span class="md-checklist__label">Cepat</span><span class="md-checklist__detail">semua halaman prerender</span>',
    );
  });

  it("shows a checklist item without a colon as a label alone", async () => {
    const output = await html(":::checklist\n- Tanpa detail\n:::");

    expect(output).toContain('<span class="md-checklist__label">Tanpa detail</span>');
    expect(output).not.toContain("md-checklist__detail");
  });
});
