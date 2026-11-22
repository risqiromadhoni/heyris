import type { APIRoute } from "astro";

import source from "@/app/pwa/service-worker.js?raw";

export const prerender = true;

const PLACEHOLDER = 'const VERSION = "dev";';

export const GET: APIRoute = () => {
  if (!source.includes(PLACEHOLDER)) {
    throw new Error(`service-worker.js must declare ${PLACEHOLDER}`);
  }

  // Prerendering runs once per build, so the version changes with every build.
  const version = Date.now().toString(36);

  return new Response(source.replace(PLACEHOLDER, `const VERSION = "${version}";`), {
    headers: { "Content-Type": "text/javascript; charset=utf-8" },
  });
};
