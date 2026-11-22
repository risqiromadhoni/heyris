import { htmlBlock, present, text } from "../nodes";

/** A commit row: the hash, when the line starts with one, and the message. */
export interface CommitRow {
  hash: string | undefined;
  message: string;
}

/** A checklist row: a label and an optional detail after it. */
export interface ChecklistRow {
  label: string;
  detail: string | undefined;
}

/** `:::commits`: one row per commit, with the full message in the `title` tooltip. */
export function commitsBlock(rows: ReadonlyArray<CommitRow>) {
  return htmlBlock(
    "ul",
    { className: ["md-commits"] },
    rows.map((row) =>
      htmlBlock("li", { className: ["md-commit"] }, [
        htmlBlock(
          "span",
          { className: ["md-commit__icon", "i-ph-git-commit"], ariaHidden: "true" },
          [],
        ),
        htmlBlock("span", { className: ["md-commit__message"], title: row.message }, [
          text(row.message),
        ]),
        ...present([
          row.hash === undefined
            ? undefined
            : htmlBlock("span", { className: ["md-commit__hash"] }, [text(row.hash)]),
        ]),
      ]),
    ),
  );
}

/** `:::checklist`: a check icon, the label and the detail of each row. */
export function checklistBlock(rows: ReadonlyArray<ChecklistRow>) {
  return htmlBlock(
    "ul",
    { className: ["md-checklist"] },
    rows.map((row) =>
      htmlBlock("li", { className: ["md-checklist__item"] }, [
        htmlBlock(
          "span",
          { className: ["md-checklist__icon", "i-ph-check-circle-fill"], ariaHidden: "true" },
          [],
        ),
        htmlBlock("span", { className: ["md-checklist__label"] }, [text(row.label)]),
        ...present([
          row.detail === undefined
            ? undefined
            : htmlBlock("span", { className: ["md-checklist__detail"] }, [text(row.detail)]),
        ]),
      ]),
    ),
  );
}
