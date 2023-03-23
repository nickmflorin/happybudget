export const reverseString = (data: string) => data.split("").reverse().join("");

export const isLetter = (value: string) => value.length === 1 && value.match(/[a-z]/i);

/**
 * Removes white space from a string.  Unnecessary white space is defined as white space that is
 * larger than 1 character in length.
 */
export const removeUnnecessaryWhitespace = (v: string) => v.replaceAll(/\s{2,}/g, " ").trim();
