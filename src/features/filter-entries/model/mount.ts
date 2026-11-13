import { LOCALES, TOPIC_PARAM, dictionaryFor } from "@/shared/i18n";
import { normalizeText } from "./text";
import { filterUrl, readFilterUrl } from "./url-state";

/**
 * Wires the search field, the topic controls and the result count of the index page that holds
 * `[data-filter-root]`. The page sets `data-locale` and `data-kind` (`writing` or `notes`), marks
 * each filterable row `data-filter-item`, and each group `data-filter-group` with a `data-count`.
 */
export function mountFilterEntries(): void {
  const root = document.querySelector("[data-filter-root]");

  if (!(root instanceof HTMLElement)) return;

  const locale = LOCALES.find((candidate) => candidate === root.dataset.locale);
  const search = root.querySelector("[data-filter-search]");
  const status = root.querySelector("[data-filter-status]");

  if (locale === undefined) return;

  if (!(search instanceof HTMLInputElement) || !(status instanceof HTMLElement)) return;

  const strings = dictionaryFor(locale);
  const isNotes = root.dataset.kind === "notes";
  const topicParam = TOPIC_PARAM[locale];
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-filter-topic]");
  const items = root.querySelectorAll<HTMLElement>("[data-filter-item]");
  const groups = root.querySelectorAll<HTMLElement>("[data-filter-group]");
  const topics = Array.from(buttons, (button) => button.dataset.filterTopic ?? "all");

  const initial = readFilterUrl(new URL(location.href), topicParam);
  let topic = topics.includes(initial.topic) ? initial.topic : "all";
  let query = initial.query;
  search.value = query;

  const countLabel = (n: number) => (isNotes ? strings.notes.count(n) : strings.writing.count(n));

  const resultsLabel = (n: number) =>
    isNotes ? strings.filter.results.notes(n) : strings.filter.results.writing(n);

  const render = (announce: boolean) => {
    const needle = normalizeText(query);
    let shown = 0;

    for (const item of items) {
      const matchesTopic = topic === "all" || item.dataset.topic === topic;
      const matchesText = normalizeText(item.dataset.search ?? "").includes(needle);
      const visible = matchesTopic && matchesText;

      item.hidden = !visible;

      if (visible) shown += 1;
    }

    for (const group of groups) {
      const visible = group.querySelectorAll("[data-filter-item]:not([hidden])").length;
      const count = group.querySelector("[data-count]");

      group.hidden = visible === 0;

      if (count !== null) count.textContent = countLabel(visible);
    }

    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.filterTopic === topic));
    }

    if (announce) status.textContent = resultsLabel(shown);
  };

  const update = (announce: boolean) => {
    render(announce);
    history.replaceState(
      history.state,
      "",
      filterUrl(new URL(location.href), topicParam, topic, query),
    );
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      topic = button.dataset.filterTopic ?? "all";
      update(true);
    });
  }

  search.addEventListener("input", () => {
    query = search.value;
    update(true);
  });

  render(false);
  root.dataset.ready = "";
}
