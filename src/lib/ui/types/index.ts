import { BasicIconProp } from "../icons";

export * from "./props";
export * from "./style";
export * from "./schemas";

export type Affix = BasicIconProp | JSX.Element;

export type Affixes = Affix | Affix[];

export type SearchIndex = string | string[];
export type SearchIndicies = SearchIndex[];

export type ModelSelectionMode = "single" | "multiple";
