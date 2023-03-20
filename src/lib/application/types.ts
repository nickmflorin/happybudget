import { enumeratedLiterals, EnumeratedLiteralType } from "lib";

export const ProductionEnvironments = enumeratedLiterals(["dev", "prod", "local"] as const);
export type ProductionEnvironment = EnumeratedLiteralType<typeof ProductionEnvironments>;
