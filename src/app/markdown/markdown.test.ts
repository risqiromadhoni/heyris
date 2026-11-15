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

describe("headings", () => {
  it("gives h2 and h3 an id and a localized # link", async () => {
    const output = await html("## Mulai di sini\n\n### Langkah kedua");

    expect(output).toContain('<h2 id="mulai-di-sini">');
    expect(output).toContain(
      '<a class="heading-anchor" href="#mulai-di-sini" aria-label="Tautan ke bagian ini"><span aria-hidden="true">#</span></a>',
    );
    expect(output).toContain('href="#langkah-kedua"');
  });

  it("keeps an id set with {#id}", async () => {
    expect(await html("## Judul baru {#judul-lama}")).toContain('href="#judul-lama"');
  });

  it("labels the link in English for English files", async () => {
    expect(await html("## Start here", EN_FILE)).toContain('aria-label="Link to this section"');
  });

  it("leaves h1 and h4 without a link", async () => {
    expect(await html("# Judul\n\n#### Kecil")).not.toContain("heading-anchor");
  });
});

describe("footnotes", () => {
  it("label the section in the file's language", async () => {
    const indonesian = await html("Teks[^1].\n\n[^1]: Catatan.");
    const english = await html("Text[^1].\n\n[^1]: Note.", EN_FILE);

    expect(indonesian).toContain(">Catatan kaki</h2>");
    expect(indonesian).toContain('aria-label="Kembali ke referensi 1"');
    expect(english).toContain(">Footnotes</h2>");
    expect(indonesian).not.toContain('href="#footnote-label"');
  });
});

describe("code blocks", () => {
  it("adds the file name and a copy button", async () => {
    const output = await html("```ts {title=retry.ts}\nconst a = 1;\n```");

    expect(output).toContain('<span class="md-code__file">retry.ts</span>');
    expect(output).toContain('data-copy-code data-copied="Tersalin"');
    expect(output.replaceAll(/<[^>]+>/g, "")).toContain("const a = 1;");
  });

  it("highlights with GitHub Light and Dark and keeps the title and gutter", async () => {
    const output = await html("```ts {title=retry.ts .line-numbers}\nconst a = 1;\nlet b;\n```");

    expect(output).toContain(
      'style="--shiki-light:#1f2328;--shiki-dark:#e6edf3;--shiki-light-bg:#ffffff;--shiki-dark-bg:#0d1117"',
    );
    expect(output).toContain(
      '<span style="--shiki-light:#CF222E;--shiki-dark:#FF7B72">const</span>',
    );
    expect(output).toContain('<span class="md-code__file">retry.ts</span>');
    expect(output).toContain('<span class="md-code__gutter" aria-hidden="true">1\n2</span>');
  });
});

describe("images", () => {
  it("fails on an image without alt text, naming the file", async () => {
    await expect(html("![](/a.png)")).rejects.toThrow(
      /Image without alt text in \/site\/src\/content\/posts\/id\/contoh\.md: \/a\.png/,
    );
  });

  it("fails on a whitespace-only alt text", async () => {
    await expect(html("![  ](/a.png)")).rejects.toThrow(/Image without alt text/);
  });

  it("fails on a reference image without alt text", async () => {
    await expect(html("![][logo]\n\n[logo]: /logo.png")).rejects.toThrow(
      /Image without alt text in .*: reference \[logo\]/,
    );
  });

  it("accepts an image with alt text", async () => {
    expect(await html("![Diagram alur](/a.png)")).toContain('alt="Diagram alur"');
  });
});

describe("container directives", () => {
  it("renders a wide figure with its backdrop", async () => {
    const output = await html(":::figure{.wide}\n![Diagram](/a.png)\n:::");

    expect(output).toContain('<figure class="md-figure md-figure--wide">');
    expect(output).toContain('<div class="md-figure__backdrop" aria-hidden="true">');
  });

  it("renders window chrome with its address", async () => {
    const output = await html('::::window{address="heyris.me"}\nIsi\n::::');

    expect(output).toContain('<span class="md-window__address">heyris.me</span>');
    expect(output).toContain('<div class="md-window__content"><p>Isi</p></div>');
  });

  it("leaves out the address pill when a window has none", async () => {
    expect(await html("::::window\nIsi\n::::")).not.toContain("md-window__address");
  });

  it("splits checklist items into label and detail", async () => {
    const output = await html(":::checklist\n- Cepat: semua halaman prerender\n:::");

    expect(output).toContain('<span class="md-checklist__label">Cepat</span>');
    expect(output).toContain('<span class="md-checklist__detail">semua halaman prerender</span>');
  });

  it("shows a checklist item without a colon as a label alone", async () => {
    const output = await html(":::checklist\n- Tanpa detail\n:::");

    expect(output).toContain('<span class="md-checklist__label">Tanpa detail</span>');
    expect(output).not.toContain("md-checklist__detail");
  });

  it("splits a commit into hash and message", async () => {
    const output = await html(":::commits\n- a1b2c3d feat: add things\n:::");

    expect(output).toContain('<span class="md-commit__hash">a1b2c3d</span>');
    expect(output).toContain('title="feat: add things">feat: add things</span>');
  });

  it("treats a one-word commit line as a message without a hash", async () => {
    const output = await html(":::commits\n- a1b2c3d\n:::");

    expect(output).toContain('<span class="md-commit__message" title="a1b2c3d">a1b2c3d</span>');
    expect(output).not.toContain("md-commit__hash");
  });

  it("connects diagram boxes, not after the last", async () => {
    const output = await html(":::diagram\n- Browser: meminta\n- Worker: merender\n:::");

    expect(output.match(/md-diagram__connector/g)).toHaveLength(1);
    expect(output).toContain('<span class="md-diagram__title">Worker</span>');
  });

  it("puts every carousel slide in the HTML", async () => {
    const output = await html(":::carousel\nSatu\n\nDua\n\nTiga\n:::");

    expect(output).toContain('aria-roledescription="carousel" aria-label="Galeri" data-carousel');
    expect(output).toContain('aria-label="3 / 3"');
    expect(output).toContain('<span class="md-carousel__counter">1 / 3</span>');
    expect(output).toContain('aria-label="Berikutnya"');
  });

  it("fails on an unknown container name", async () => {
    await expect(html(":::gallery\nIsi\n:::")).rejects.toThrow(/Unknown directive :::gallery/);
  });

  it("keeps text directives as the literal text", async () => {
    expect(await html("Ingat Catatan:penting di sini.")).toContain(
      "<p>Ingat Catatan:penting di sini.</p>",
    );
  });
});
