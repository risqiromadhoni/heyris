/** Attribute values the plugins set: strings, numbers, flags and class lists. */
export type Props = Record<string, string | number | boolean | Array<string>>;

/** A text node, valid in both mdast and hast. */
export interface TextNode {
  type: "text";
  value: string;
}

/** A hast element whose children are `C`: existing hast nodes, built elements or text. */
export interface HastElement<C> {
  type: "element";
  tagName: string;
  properties: Props;
  children: Array<C>;
}

/** An mdast parent that Sätteri renders as an HTML element named by `data.hName`. */
export interface HtmlBlock<C> {
  type: "mdHtml";
  data: { hName: string; hProperties: Props };
  children: Array<C>;
}

/** Build a hast element. Children may also be existing hast nodes. */
export function element<C extends { type: string }>(
  tagName: string,
  properties: Props,
  children: ReadonlyArray<C>,
): HastElement<C> {
  return { type: "element", tagName, properties, children: [...children] };
}

/** Build a text node. */
export function text(value: string): TextNode {
  return { type: "text", value };
}

/**
 * Build an mdast node that renders as an HTML element: a parent with `data.hName` and
 * `data.hProperties`, which Sätteri turns into the element and keeps its children.
 */
export function htmlBlock<C extends { type: string }>(
  hName: string,
  hProperties: Props,
  children: ReadonlyArray<C>,
): HtmlBlock<C> {
  return { type: "mdHtml", data: { hName, hProperties }, children: [...children] };
}

/** Drop the `undefined` entries of a child list, so optional parts can be written inline. */
export function present<C>(children: ReadonlyArray<C | undefined>): Array<C> {
  return children.filter((child): child is C => child !== undefined);
}

/** A class list: the base class, then each modifier that is not `false`. */
export function classes(base: string, ...modifiers: Array<string | false>): Array<string> {
  return [base, ...modifiers.filter((name): name is string => name !== false)];
}
