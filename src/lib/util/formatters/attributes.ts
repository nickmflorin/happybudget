import { z } from "zod";

import { logger } from "internal";

import { removeObjAttributes } from "../util";

import { toSentence } from "./formal";

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

export const stringifyZodIssue = <Z extends z.ZodIssue>(
  issue: Z,
  options?: Omit<
    Partial<StringifyAttributesOptions<Z & Record<string, unknown>>>,
    "messageKey" | "ignore" | "message"
  > & {
    readonly ignore: Exclude<
      StringifyAttributesOptions<Z & Record<string, unknown>>["ignore"],
      "message"
    >;
  },
): string =>
  stringifyAttributes(issue as Z & Record<string, unknown>, {
    ...options,
    messageKey: "message",
    ignore: ["minimum", "maximum", "inclusive", "exact", "options"],
  });

export const stringifyZodIssues = <Z extends z.ZodIssue>(
  issues: Z[],
  options?: Omit<
    Partial<StringifyAttributesOptions<Z & Record<string, unknown>>>,
    "messageKey" | "ignore" | "message"
  > & {
    readonly ignore: Exclude<
      StringifyAttributesOptions<Z & Record<string, unknown>>["ignore"],
      "message"
    >;
  },
): string =>
  stringifyAttributes<Z & Record<string, unknown>>(issues as (Z & Record<string, unknown>)[], {
    ...options,
    stringifyElement: (v: Z & Record<string, unknown>) => stringifyZodIssue(v, options),
  });
