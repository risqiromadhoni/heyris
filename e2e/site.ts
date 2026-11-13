import { DEFAULT_APP_SITE } from "../env.ts";

/** The site origin as astro.config.mjs resolves `site`: `VITE_APP_SITE` from the shell, else the default. */
export const APP_SITE = process.env.VITE_APP_SITE || DEFAULT_APP_SITE;
