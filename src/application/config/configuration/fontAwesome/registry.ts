/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { parseBoolean } from "lib/util/parsers";

import { FREE_ICON_REGISTRY } from "./freeRegistry";
import { PRO_ICON_REGISTRY } from "./proRegistry";
import { NaiveFAIconDefinition } from "./types";

let IconRegistry: readonly NaiveFAIconDefinition[] = [];

const PRO_FONT_AWESOME = process.env.PRO_FONT_AWESOME;
if (PRO_FONT_AWESOME !== undefined) {
  const sanitizedProFontAwesome = parseBoolean(PRO_FONT_AWESOME, {
    strict: true,
    errorMessage: "The environment variable 'PRO_FONT_AWESOME' is invalid.",
  });
  if (sanitizedProFontAwesome === true) {
    if (process.env.FONTAWESOME_NPM_AUTH_TOKEN === undefined) {
      throw new TypeError("'FONTAWESOME_NPM_AUTH_TOKEN' is not present in the environment.");
    }
    IconRegistry = PRO_ICON_REGISTRY;
  } else {
    IconRegistry = FREE_ICON_REGISTRY;
  }
} else {
  throw new TypeError("'FONTAWESOME_NPM_AUTH_TOKEN' is not present in the environment.");
}

export const ICON_REGISTRY = IconRegistry;
