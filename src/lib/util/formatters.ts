import { Moment } from "moment";
import { toDisplayDate } from "./dates";

import { logger } from "internal";

import { RequireOne } from "./types";
import { removeObjAttributes } from "./util";
import * as validators from "./validators";

const PUNCTUATION = [".", ",", "!", "?"] as const;
type Punctuation = (typeof PUNCTUATION)[number];

export const reverseString = (data: string) => data.split("").reverse().join("");

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} data The string to capitalize.
 * @returns {string} The capitalized string.
 */
export const capitalizeFirstAlphaChar = (data: string) => {
  const trimmed = data.trimStart();
  for (let i = 0; i < trimmed.length; i++) {
    if (isLetter(trimmed[i])) {
      return trimmed.slice(0, i) + trimmed.charAt(i).toUpperCase() + trimmed.slice(i + 1);
    }
  }
  return data;
};

export const isLetter = (value: string) => value.length === 1 && value.match(/[a-z]/i);

/**
 * Removes white space from a string.  Unnecessary white space is defined as white space that is
 * larger than 1 character in length.
 */
export const removeUnnecessaryWhitespace = (v: string) => v.replaceAll(/\s{2,}/g, " ").trim();

type SuffixPunctuationOptions = {
  readonly remove?: Punctuation | Punctuation[] | true;
  readonly add?: Punctuation;
};

/**
 * Formats the provided string as a sentence, capitalizing the first letter and inserting
 * punctuation at the end.
 *
 * @param {string} data The string that should be formatted as a sentence.
 * @returns {string}
 */
export const toSentence = (data: string) =>
  removeUnnecessaryWhitespace(
    manageSuffixPunctuation(capitalizeFirstAlphaChar(data.trim()), {
      add: ".",
      remove: true,
    }),
  );

/* Removes punctuation at the end of the string based on the provided options.
   The provided options specify whether or not a single type of punctuation should be removed, a
   set of specific punctuations should be removed, or all punctuations should be removed - where
   each punctuation character removed is only removed if it is at the end of the string.
   Punctuation at the end of the string that is not included in the options (unless the options
   specify { remove: true } which communicates 'all punctuation' ) will be left in tact.
   This function is privately scoped and should not be used outside of this module.  Instead, the
   'manageSuffixPunctuation' should be used.
   */
const _removeSuffixPunctuation = (
  data: string,
  opts?: Pick<SuffixPunctuationOptions, "remove">,
): string => {
  const r = opts?.remove === undefined ? true : opts.remove;
  const toRemove = typeof r === "string" ? [r] : r;

  const punctuationMeetsCriteria = (d: Punctuation) => {
    if (toRemove === true) {
      return PUNCTUATION.includes(d as Punctuation);
    }
    return validators.validateAny(toRemove, (c: Punctuation) => c === d);
  };

  let endPunctuation: Punctuation[] = [];
  const reversed = reverseString(data);
  for (let i = 0; i < reversed.length; i++) {
    if (PUNCTUATION.includes(reversed[i] as Punctuation)) {
      endPunctuation = [...endPunctuation, reversed[i] as Punctuation];
    } else {
      break;
    }
  }
  /* With the punctuation at the end of the string collected, add it back in to base string one
     character at a time, for each character that is not being removed. */
  return endPunctuation
    .reverse()
    .reduce(
      (prev: string, curr: Punctuation) => (punctuationMeetsCriteria(curr) ? prev : prev + curr),
      data.slice(0, data.length - endPunctuation.length),
    );
};

/**
 * Adds, removes or removes and then adds suffix punctuation to the string based on the options
 * provided.
 *
 * Usage
 * -----
 * // Returns "the fox jumped over the log!"
 * manageSuffixPunctuation("the fox jumped over the log,.", {
 *   remove: true, // All existing punctuation at the end of the string should be removed.
 *   add: "!", // After existing punctuation is removed, add "!"
 * })
 *
 * @param {string} data The string for which the suffix punctuation should be modified.
 * @param {RequireOne<SuffixPunctuationOptions>} opts
 *   Options that dictate what punctuation (if any) should be added and/or removed.
 * @returns {string}
 */
export const manageSuffixPunctuation = (
  data: string,
  opts: RequireOne<SuffixPunctuationOptions>,
): string => {
  if (opts.remove !== undefined) {
    data = _removeSuffixPunctuation(data, opts);
  }
  if (typeof opts.add === "string" && !data.endsWith(opts.add)) {
    data = `${data}${opts.add}`;
  }
  return data;
};

type StringifyEnumeratedOptions<T extends string | number | boolean | Record<string, unknown>> = {
  readonly numbered: false;
  readonly delimiter: string;
  readonly stringifyElement: (v: T) => string;
};

/**
 * Stringifies an iterable of elements into an enumerated representation.
 *
 * @param {T[]} data
 *   An array of elements that should be stringified into an enumerated list.
 * @param {Partial<StringifyEnumeratedOptions<T>>} options
 *   Options that dictate the stringification.
 * @returns {string}
 */
export const stringifyEnumerated = <T extends string | number | boolean | Record<string, unknown>>(
  data: T[],
  options?: Partial<StringifyEnumeratedOptions<T>>,
): string => {
  const delimiter = options?.delimiter === undefined ? " " : options.delimiter;
  const stringifyElement =
    options?.stringifyElement === undefined ? (v: T) => String(v) : options?.stringifyElement;
  return data.map((d: T, index: number) => `${index + 1}. ${stringifyElement(d)}`).join(delimiter);
};

type StringifyAttributeOptions<T extends Record<string, unknown>> = {
  readonly ignore: (keyof T & string)[];
  readonly messageKey: keyof T & string;
  readonly message: string;
  readonly delimiter: string;
  readonly stringifyKeyValue: (k: keyof T, v: T[keyof T]) => string;
};

type StringifyAttributesOptions<T extends Record<string, unknown>> = Omit<
  StringifyAttributeOptions<T>,
  "message"
> &
  StringifyEnumeratedOptions<T>;

export function stringifyAttributes<T extends Record<string, unknown>>(
  d: T,
  options?: Partial<StringifyAttributeOptions<T>>,
): string;

export function stringifyAttributes<T extends Record<string, unknown>>(
  d: T[],
  options?: Partial<StringifyAttributesOptions<T>>,
): string;

/**
 * Returns a string representation of a single object set of attributes, {@link T}, or an array
 * of object attributes, {@link T[]}.
 *
 * Usage
 * -----
 * 1. Creating a String Representation of a Set of Attributes
 *
 *    stringifyAttributes(
 *      { fruit: "apple", color: "red", info: "A red apple." },
 *      { messageKey: "info" }
 *    );
 *    >>> "(fruit = apple, color = red) A red apple."
 *
 * 2. Creating a String Representation of an Array of Attributes
 *
 *    stringifyAttributes(
 *      [
 *        { fruit: "apple", color: "red", info: "A red apple." },
 *        { fruit: "pear", color: "green", info: "A green pear." }
 *      ],
 *      { messageKey: "info" }
 *    );
 *    >>> "1. (fruit = apple, color = red) A red apple. 2. (fruit=pear, color=green) A green pear."
 *
 * @param {T | T[]} data
 *   Either the attributes object or an array of attribute objects that should be stringified.
 * @param {Partial<StringifyAttributeOptions<T>> | Partial<StringifyAttributesOptions<T>>} options
 *   Options that dictate the stringification.
 * @returns {string}
 */
export function stringifyAttributes<T extends Record<string, unknown>>(
  data: T | T[],
  options?: Partial<StringifyAttributeOptions<T>> | Partial<StringifyAttributesOptions<T>>,
): string {
  /* If an array of attributes was provided, simply stringify each one independently and then join
     them into an enumerated string. */
  if (Array.isArray(data)) {
    return stringifyEnumerated(data, {
      stringifyElement: (v: T) => stringifyAttributes(v, options),
      ...options,
    });
  }
  // A value that will appear at the end of the string, after the attributes have been stringified.
  const message =
    options === undefined ? undefined : (options as Partial<StringifyAttributeOptions<T>>).message;

  /* Attributes that should be ignored from the string.  If a message key is provided, that
     attribute should also be ignored because it will be included at the end. */
  let ignore = options?.ignore === undefined ? [] : options?.ignore;
  ignore =
    options?.messageKey !== undefined && message === undefined
      ? [...ignore, options?.messageKey]
      : ignore;

  /* Specifying both the messageKey and the message is counterintuitive, because the messageKey
     identifies a key in the object or objects for which the value should be treated as the
     message. */
  if (options?.messageKey !== undefined && message !== undefined) {
    logger.warn("The 'message' is not applicable if the 'messageKey' is provided.");
  }

  const stringifyKeyValue =
    options?.stringifyKeyValue === undefined
      ? (k: keyof T & string, v: T[keyof T]) => `${k} = ${String(v)}`
      : options?.stringifyKeyValue;

  const base = `(${Object.keys(removeObjAttributes<T>(data, ignore))
    .map((k: string) => stringifyKeyValue(k as string & keyof T, data[k as string & keyof T]))
    .join(options?.delimiter || ", ")})`;

  if (message !== undefined) {
    return `${base}: ${toSentence(message)}`;
  } else if (options?.messageKey !== undefined) {
    const msg = data[options?.messageKey];
    if (msg !== undefined) {
      return `${base}: ${msg}`;
    }
  }
  return base;
}

type Fmt<T extends string | number | Moment = string | number> = (
  v: T,
  opts: FormatterOpts<T>,
) => string;

type PARAMS<T extends string | number | Moment = string | number> =
  | FormatterParams<T>
  | FormatterOpts<T>
  | OnFormatError<T>;

type RT<
  T extends string | number | Moment = string | number,
  P extends PARAMS<T> = PARAMS<T>,
> = P extends FormatterParams<T> ? string : Formatter<T>;

const isFormatterCallbackOpts = <T extends string | number | Moment = string | number>(
  p: PARAMS<T>,
): p is FormatterCalbackOpts<T> =>
  p !== null && (p as FormatterCalbackOpts<T>).onError !== undefined;

const isFormatterErrorValueOpts = <T extends string | number | Moment = string | number>(
  p: PARAMS<T>,
): p is FormatterErrorValueOpts =>
  p !== null && (p as FormatterErrorValueOpts).errorValue !== undefined;

const isFormatterOpts = <T extends string | number | Moment = string | number>(
  p: PARAMS<T>,
): p is FormatterOpts<T> => isFormatterCallbackOpts(p) || isFormatterErrorValueOpts(p);

const isFormatterParams = <T extends string | number | Moment = string | number>(
  p: PARAMS<T>,
): p is FormatterParams<T> => typeof p !== "function" && !isFormatterOpts(p);

const isErrorHandler = <T extends string | number | Moment = string | number>(
  p: PARAMS<T>,
): p is OnFormatError<T> => typeof p === "function";

export const isAgFormatterParams = <T extends string | number | Moment = string | number>(
  params: NativeFormatterParams<T> | AGFormatterParams,
): params is AGFormatterParams => params !== null && typeof params === "object";

const formatAs = <
  T extends string | number | Moment = string | number,
  O extends FormatterOpts<T> = FormatterOpts<T>,
  P extends PARAMS<T> = PARAMS<T>,
>(
  fmt: Fmt<T>,
  fmtType: FormatType,
  p: P,
): RT<T, P> => {
  const valuedFormatter = (params: FormatterParams<T>, options: O): string => {
    const v: T | null = isAgFormatterParams(params) ? params.value : params;
    if (v === null || (typeof v === "string" && v.trim() === "")) {
      return "";
    }
    return fmt(v, options);
  };

  if (isFormatterParams(p)) {
    return valuedFormatter(p, {
      onError: (v: T) => console.error(`Could not parse value ${String(v)} into ${fmtType}!`),
    } as O) as RT<T, P>;
  } else if (isErrorHandler(p)) {
    const opts = { onError: p } as O;
    return ((params: FormatterParams<T>) => valuedFormatter(params, opts)) as RT<T, P>;
  } else {
    return ((params: FormatterParams<T>) => valuedFormatter(params, p as unknown as O)) as RT<T, P>;
  }
};

export const currencyFormatter = <P extends PARAMS<string | number>>(params: P) =>
  formatAs<string | number, FormatterOpts, P>(
    (v: string | number, opts: FormatterOpts) => {
      const numericValue = parseFloat(String(v));
      if (isNaN(numericValue)) {
        if (isFormatterCallbackOpts(opts)) {
          opts.onError(v);
          return "";
        }
        return opts.errorValue;
      }
      return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    },
    "currency",
    params,
  );

export const percentageFormatter = <P extends PARAMS<string | number>>(params: P) =>
  formatAs<string | number, FormatterOpts, P>(
    (v: string | number, opts: FormatterOpts) => {
      const numericValue = parseFloat(String(v));
      if (isNaN(numericValue)) {
        if (isFormatterCallbackOpts(opts)) {
          opts.onError(v);
          return "";
        }
        return opts.errorValue;
      }
      return Number(v).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
    },
    "percentage",
    params,
  );

export const phoneNumberFormatter = <P extends PARAMS<string | number>>(params: P) =>
  formatAs<string | number, FormatterOpts, P>(
    (v: string | number) => {
      const numeric = String(v).replace(/\D/g, "");
      if (numeric.length >= 12) {
        // Don't format string.
        return numeric;
      } else if (numeric.length === 11 || numeric.length === 10) {
        const match = /^(1|)?(\d{3})(\d{3})(\d{4})$/.exec(numeric);
        if (match) {
          const intlCode = match[1] ? "+1 " : "";
          return [intlCode, "(", match[2], ") ", match[3], " ", match[4]].join("");
        } else {
          return numeric;
        }
      } else {
        if (numeric.length < 3) {
          return numeric;
        } else {
          const firstPart = "(" + numeric.slice(0, 3) + ")";
          if (numeric.length === 3) {
            return firstPart;
          } else {
            const secondPart = numeric.slice(3, 6);
            if (numeric.length <= 6) {
              return firstPart + " " + secondPart;
            } else {
              const thirdPart = numeric.slice(6, 10);
              return firstPart + " " + secondPart + " " + thirdPart;
            }
          }
        }
      }
    },
    "phoneNumber",
    params,
  );

export const dateFormatter = <P extends PARAMS<string | Moment>>(params: P) =>
  formatAs<string | Moment, FormatterOpts<string | Moment>, P>(
    (v: string | Moment, opts: FormatterOpts<string | Moment>) => {
      const formatted = toDisplayDate(v);
      if (formatted === undefined) {
        if (isFormatterCallbackOpts(opts)) {
          opts.onError(v);
          return "";
        }
        return opts.errorValue;
      }
      return formatted;
    },
    "percentage",
    params,
  );

export const titleCaseFormatter = <P extends PARAMS<string>>(params: P) =>
  formatAs<string, FormatterOpts<string>, P>(
    (v: string) =>
      v.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }),
    "percentage",
    params,
  );
