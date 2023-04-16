import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";

export const SpinnerSizes = enumeratedLiterals(["small", "medium", "large", "fill"] as const);
export type SpinnerSize = EnumeratedLiteralType<typeof SpinnerSizes>;
