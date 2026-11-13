import { postMarkdownEndpoint } from "@/_pages/post";

export const prerender = true;

const endpoint = postMarkdownEndpoint("id");

export const getStaticPaths = endpoint.getStaticPaths;
export const GET = endpoint.GET;
