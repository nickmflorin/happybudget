import { BasicIconProp } from "../icons";

export * from "./props";
export * from "./style";

export type Affix = BasicIconProp | JSX.Element;

export type Affixes = Affix | Affix[];
