import { logger } from "internal";

import * as formatters from "./formatters";
import { stringIsInteger } from "./typeguards";

export const isInteger = (n: number) => Number(n) === n && n % 1 === 0;

type StringParserOptions<D = unknown> = {
  readonly strict?: true;
  readonly defaultValue?: D;
  readonly errorMessage?: string;
  readonly logInvalid?: false;
};

type StringParserReturn<
  V,
  O extends StringParserOptions | undefined = StringParserOptions,
> = O extends {
  readonly strict: true;
}
  ? V
  : O extends { readonly defaultValue: infer Di }
  ? V | Di
  : V | null;

export const parseInteger = <O extends StringParserOptions = StringParserOptions>(
  v: string | number,
  options?: O,
): StringParserReturn<number, O> => {
  const defaultValue = options?.defaultValue ?? null;
  if (typeof v === "string" && stringIsInteger(v)) {
    return parseInteger(parseInt(v), options);
  } else if (typeof v === "number" && isInteger(v)) {
    return v as StringParserReturn<number, O>;
  } else if (typeof v === "number" && options?.strict !== true) {
    return Math.floor(v) as StringParserReturn<number, O>;
  }
  let message = `Value ${v} cannot be converted to an integer.`;
  if (options?.errorMessage) {
    message =
      formatters.manageSuffixPunctuation(options.errorMessage, { remove: true, add: ":" }) +
      " " +
      message;
  }
  if (options?.strict) {
    throw new Error(message);
  } else if (options?.logInvalid !== false) {
    logger.warn({ value: v }, message);
  }
  return defaultValue as StringParserReturn<number, O>;
};

type StringBooleanParserOptions<D = unknown> = StringParserOptions<D> & {
  readonly allowBinary?: true;
  readonly allowOnOff?: true;
  readonly defaultValue?: boolean;
};

export const getTruthyValues = (options?: StringBooleanParserOptions): string[] =>
  [
    "true",
    options?.allowBinary === true ? "1" : null,
    options?.allowOnOff === true ? "on" : null,
  ].filter((v: string | null) => v !== null) as string[];

export const getFalseyValues = (options?: StringBooleanParserOptions): string[] =>
  [
    "false",
    options?.allowBinary === true ? "0" : null,
    options?.allowOnOff === true ? "off" : null,
  ].filter((v: string | null) => v !== null) as string[];

export const parseBoolean = <O extends StringBooleanParserOptions = StringBooleanParserOptions>(
  v: string | boolean,
  options?: O,
): StringParserReturn<boolean, O> => {
  const defaultValue = options?.defaultValue ?? null;
  if (typeof v === "string") {
    if (getTruthyValues(options).includes(v.toLowerCase())) {
      return true as StringParserReturn<boolean, O>;
    } else if (getFalseyValues(options).includes(v.toLowerCase())) {
      return false as StringParserReturn<boolean, O>;
    }
    let message = `Value ${v} cannot be converted to a boolean.`;
    if (options?.errorMessage) {
      message =
        formatters.manageSuffixPunctuation(options.errorMessage, { remove: true, add: ":" }) +
        " " +
        message;
    }
    if (options?.strict === true) {
      throw new Error(message);
    } else if (options?.logInvalid !== false) {
      logger.warn({ value: v }, message);
    }
    return defaultValue as StringParserReturn<boolean, O>;
  }
  return v as StringParserReturn<boolean, O>;
};
