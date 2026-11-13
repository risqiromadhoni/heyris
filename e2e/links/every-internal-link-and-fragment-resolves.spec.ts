// spec: specs/links.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

/** Paths ending in a file extension (`.md`, `.xml`, `.txt`, images) are not HTML: they are checked for status only. */
const FILE_EXTENSION = /\.[a-z0-9]+$/i;

interface PageScan {
  targets: string[];
  ids: string[];
}

/** Reads a page's link targets and element ids. It runs in the browser through `page.evaluate`, so it has no closure. */
function scanPage(html: string): PageScan {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const targets = Array.from(doc.querySelectorAll("a[href], link[href]"), (element) => {
    return element.getAttribute("href") ?? "";
  });

  const ids = Array.from(doc.querySelectorAll("[id]"), (element) => element.id);

  return { targets, ids };
}

test.describe("Links", () => {
  test("Resolves every internal link and #fragment reachable from / and /en", async ({
    page,
    request,
  }) => {
    test.setTimeout(60_000);

    // 1. Open the home page at / to learn the site origin
    await page.goto("/");
    const origin = new URL(page.url()).origin;

    // 2. Crawl breadth-first from / and /en, visiting each URL once
    const queue = ["/", "/en"].map((path) => new URL(path, origin).href);
    const seen = new Set(queue);
    const idsByUrl = new Map<string, Set<string>>();
    const fragments: { from: string; to: string; id: string }[] = [];
    const failures: string[] = [];

    for (let index = 0; index < queue.length; index += 1) {
      const url = queue[index];

      const response = await request.get(url);

      if (response.status() !== 200) {
        failures.push(`${url} returned ${response.status()}`);
        continue;
      }

      // Status only for files: there is no HTML to scan.
      if (FILE_EXTENSION.test(new URL(url).pathname)) continue;

      const scan = await page.evaluate(scanPage, await response.text());
      idsByUrl.set(url, new Set(scan.ids));

      for (const target of scan.targets) {
        const link = new URL(target, url);

        // Other origins and mailto: links are not part of the site.
        if (link.origin !== origin) continue;

        const id = link.hash.slice(1);
        link.hash = "";

        if (id) fragments.push({ from: url, to: link.href, id: decodeURIComponent(id) });

        if (!seen.has(link.href)) {
          seen.add(link.href);
          queue.push(link.href);
        }
      }
    }

    // 3. Check that every #fragment names an element id on the page it points to
    for (const fragment of fragments) {
      const ids = idsByUrl.get(fragment.to);

      if (ids && !ids.has(fragment.id)) {
        failures.push(
          `${fragment.from} links to ${fragment.to}#${fragment.id}, which has no such id`,
        );
      }
    }

    // 4. Expect the crawl followed links beyond the two start pages, and found no broken link or fragment
    expect(queue.length).toBeGreaterThan(2);
    expect(failures).toEqual([]);
  });
});
