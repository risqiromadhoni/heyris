import { noteMarkdownEndpoint } from "@/_pages/note";

export const prerender = true;

const endpoint = noteMarkdownEndpoint("en");

export const getStaticPaths = endpoint.getStaticPaths;
export const GET = endpoint.GET;
