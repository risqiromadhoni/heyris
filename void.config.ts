import { defineConfig } from "void/config";

export default defineConfig({
  cloudflare: {
    name: "heyris",
    account_id: "34bc2037f78fbf5cb12c588a74a23d47",
    compatibility_date: "2026-11-10",
    compatibility_flags: ["nodejs_als"],
    // A custom domain turns workers.dev off by default, and Void verifies each deploy through
    // a workers.dev preview URL, so deploys fail without these two.
    workers_dev: true,
    preview_urls: true,
    routes: [{ pattern: "heyris.me", custom_domain: true }],
  },
});
