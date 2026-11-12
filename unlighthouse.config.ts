import { defineUnlighthouseConfig } from "unlighthouse/config";

export default defineUnlighthouseConfig({
  site: "http://localhost:4321",
  ci: {
    budget: {
      performance: 90,
      accessibility: 100,
      "best-practices": 100,
      seo: 90,
    },
    buildStatic: true,
  },
});
