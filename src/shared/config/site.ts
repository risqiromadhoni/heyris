/**
 * Site-wide constants. Each value appears once here and is read everywhere else.
 * `url` is `site` from astro.config.mjs, which comes from `VITE_APP_SITE`.
 */
export const SITE = {
  name: "@risqiromadhoni",
  author: "Risqi Romadhoni",
  email: "halo@heyris.me",
  github: "https://github.com/risqiromadhoni",
  linkedin: "https://www.linkedin.com/in/risqir",
  url: import.meta.env.SITE,
} as const;
