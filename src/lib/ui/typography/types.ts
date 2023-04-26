import { enumeratedLiterals } from "../../util/literals";
import { EnumeratedLiteralType } from "../../util/types/literals";

export const TypographyTypes = enumeratedLiterals(["heading", "body", "label"] as const);
export type TypographyType = EnumeratedLiteralType<typeof TypographyTypes>;

export const TypographyTypeLevelsMap = {
  heading: [1, 2, 3, 4] as const,
  body: [1, 2, 3, 4, 5, 6] as const,
  label: [1, 2, 3] as const,
};

type TypographyTypeLevels = {
  heading: 1 | 2 | 3 | 4;
  body: 1 | 2 | 3 | 4 | 5 | 6;
  label: 1 | 2 | 3;
};

export type TypographyTypeLevel<L extends TypographyType> = TypographyTypeLevels[L];

export const DEFAULT_HEADING_LEVEL: TypographyTypeLevel<"heading"> = 1;
export const DEFAULT_BODY_LEVEL: TypographyTypeLevel<"body"> = 3;
export const DEFAULT_LABEL_LEVEL: TypographyTypeLevel<"label"> = 1;

export const TypographyWeightNames = enumeratedLiterals([
  "light",
  "regular",
  "medium",
  "bold",
  "heavy",
] as const);
export type TypographyWeightName = EnumeratedLiteralType<typeof TypographyWeightNames>;

export const TextTransforms = enumeratedLiterals(["caps", "underline"] as const);
export type TextTransform = EnumeratedLiteralType<typeof TextTransforms>;
