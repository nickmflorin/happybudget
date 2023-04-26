import { enumeratedLiterals } from "../../util/literals";
import { EnumeratedLiteralType } from "../../util/types/literals";

export const SpinnerSizes = enumeratedLiterals(["small", "medium", "large", "fill"] as const);
export type SpinnerSize = EnumeratedLiteralType<typeof SpinnerSizes>;
