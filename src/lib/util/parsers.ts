import { stringIsInteger } from "./typeguards";

export const isInteger = (n: number) => Number(n) === n && n % 1 === 0;

type StringParserOptions = {
  readonly strict?: true;
};

type StringParserReturn<V, O extends StringParserOptions = StringParserOptions> = O extends {
  readonly strict: true;
}
  ? V
  : V | null;

type StringParser<V, O extends StringParserOptions = StringParserOptions> = (
  value: string | V,
  options?: O,
) => StringParserReturn<V, O>;

export const parseInteger: StringParser<number> = (v, options) => {
  if (typeof v === "string" && stringIsInteger(v)) {
    return parseInteger(parseInt(v), options);
  } else if (typeof v === "number" && isInteger(v)) {
    return v;
  } else if (typeof v === "number" && options?.strict !== true) {
    return Math.floor(v);
  } else if (options?.strict === true) {
    throw new Error(`Value ${v} cannot be converted to an integer.`);
  }
  return null;
};

const TRUTHY_VALUES = ["1", "true", "on"];
const FALSEY_VALUES = ["0", "false", "off"];

export const parseBoolean: StringParser<boolean> = (v, options) => {
  if (typeof v === "string") {
    if (TRUTHY_VALUES.includes(v.toLowerCase())) {
      return true;
    } else if (FALSEY_VALUES.includes(v.toLowerCase())) {
      return false;
    } else if (options?.strict === true) {
      throw new Error(`Value ${v} cannot be converted to a boolean.`);
    }
    return null;
  }
  return v;
};
