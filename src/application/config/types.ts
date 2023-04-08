import { enumeratedLiterals, EnumeratedLiteralType } from "lib";

export const ProductionEnvironments = enumeratedLiterals(["dev", "app", "local"] as const);
export type ProductionEnvironment = EnumeratedLiteralType<typeof ProductionEnvironments>;
