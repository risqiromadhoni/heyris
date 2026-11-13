/** A list item split at its first separator. `tail` is undefined when there was none. */
export interface SplitItem {
  head: string;
  tail: string | undefined;
}

/** A commit row: the hash, when the line starts with one, and the message. */
export interface CommitParts {
  hash: string | undefined;
  message: string;
}

/** Split a list item's text at its first `separator`: the part before it, and the rest if any. */
export function splitFirst(item: string, separator: string): SplitItem {
  const at = item.indexOf(separator);

  if (at === -1) return { head: item, tail: undefined };

  return { head: item.slice(0, at), tail: item.slice(at + separator.length) };
}

/** A commit line is `hash message`; the hash is the first word. */
export function splitCommit(item: string): CommitParts {
  const match = /^(\S+)\s+(.*)$/s.exec(item);

  if (match === null) return { hash: undefined, message: item };

  return { hash: match[1], message: match[2] ?? "" };
}
