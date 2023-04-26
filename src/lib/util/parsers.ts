import { z } from "zod";

import { logger } from "internal";

import * as formatters from "./formatters";

export const isInteger = (n: number) => Number(n) === n && n % 1 === 0;

export const isStringInteger = (n: string | number) => z.coerce.number().int().safeParse(n).success;

export const isStringNumber = (n: string | number) => z.coerce.number().safeParse(n).success;

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

  const result = z.coerce.number().int().safeParse(v);
  if (result.success) {
    return result.data as StringParserReturn<number, O>;
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

export const parseNumber = <O extends StringParserOptions = StringParserOptions>(
  v: string | number,
  options?: O,
): StringParserReturn<number, O> => {
  const defaultValue = options?.defaultValue ?? null;

  const result = z.coerce.number().safeParse(v);
  if (result.success) {
    return result.data as StringParserReturn<number, O>;
  }
  let message = `Value ${v} cannot be converted to a number.`;
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
