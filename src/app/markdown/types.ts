import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

// One entry of a Sätteri plugin list that is a plugin object, not a factory or a nested list.
type Entry<Key extends "mdastPlugins" | "hastPlugins"> = Extract<
  NonNullable<NonNullable<SatteriProcessorOptions[Key]>[number]>,
  { name: string }
>;

/** A plugin object for `mdastPlugins`: its visitors receive typed Sätteri nodes and contexts. */
export type MdastPlugin = Entry<"mdastPlugins">;

/** A plugin object for `hastPlugins`. */
export type HastPlugin = Entry<"hastPlugins">;
