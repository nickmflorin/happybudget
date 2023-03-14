import { FREE_ICON_REGISTRY } from "./freeRegistry";
import { PRO_ICON_REGISTRY } from "./proRegistry";
import { NaiveFAIconDefinition } from "./types";

let IconRegistry: readonly NaiveFAIconDefinition[] = [];

const PRO_FONT_AWESOME = process.env.PRO_FONT_AWESOME;
if (PRO_FONT_AWESOME !== undefined && PRO_FONT_AWESOME.toLowerCase() === "true") {
  if (process.env.FONTAWESOME_NPM_AUTH_TOKEN === undefined) {
    throw new TypeError("'FONTAWESOME_NPM_AUTH_TOKEN' is not present in the environment.");
  }
  IconRegistry = PRO_ICON_REGISTRY;
} else {
  IconRegistry = FREE_ICON_REGISTRY;
}

export const ICON_REGISTRY = IconRegistry;
