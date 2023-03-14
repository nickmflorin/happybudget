import { enumeratedLiteralsMap, EnumeratedLiteralType } from "lib";

export const ProductionEnvironments = enumeratedLiteralsMap(["dev", "prod", "local"] as const);
export type ProductionEnvironment = EnumeratedLiteralType<typeof ProductionEnvironments>;
