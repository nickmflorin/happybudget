import { RequireOne } from "../types";
import * as validators from "../validators";

import { reverseString, isLetter, removeUnnecessaryWhitespace } from "./util";

const PUNCTUATION = [".", ",", "!", "?", ":"] as const;
type Punctuation = typeof PUNCTUATION[number];

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

/*
Removes punctuation at the end of the string based on the provided options.

The provided options specify whether or not a single type of punctuation should be removed, a set of
specific punctuations should be removed, or all punctuations should be removed - where each
punctuation character removed is only removed if it is at the end of the string.

Punctuation at the end of the string that is not included in the options (unless the options specify
{ remove: true } which communicates 'all punctuation' ) will be left in tact.

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
