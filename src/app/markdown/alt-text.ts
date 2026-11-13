import { describeSource } from "./source";
import type { MdastPlugin } from "./types";

/** Fail the build on an image with no alt text, naming the file and the image. */
export function altTextRule(fileURL: URL | undefined): MdastPlugin {
  const source = describeSource(fileURL);

  return {
    name: "md-alt-text",
    image(node) {
      if ((node.alt ?? "").trim() === "") {
        throw new Error(
          `Image without alt text in ${source}: ${node.url}. Write a description inside the brackets.`,
        );
      }
    },
    imageReference(node) {
      if ((node.alt ?? "").trim() === "") {
        throw new Error(
          `Image without alt text in ${source}: reference [${node.identifier}]. Write a description inside the brackets.`,
        );
      }
    },
  };
}
