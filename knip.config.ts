import type { KnipConfig } from "knip";

import { TOOLING_IGNORE_PATTERNS } from "./tools/ignore-patterns.ts";

const config: KnipConfig = {
  entry: ["void.config.ts", "unlighthouse.config.ts"],
  project: ["**/*", ...TOOLING_IGNORE_PATTERNS.map((pattern) => `!${pattern}`)],
};

export default config;
