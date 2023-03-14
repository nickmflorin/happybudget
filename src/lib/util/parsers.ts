import { stringIsInteger } from "./typeguards";

export const isInteger = (n: number) => Number(n) === n && n % 1 === 0;

/**
 * Returns the provided value as an integer number *only* in the case that it is already an integer
 * or is a string representation of an integer.  If the value is not of those forms, null will be
 * returned.
 *
 * Usage
 * -----
 * // Returns 5
 * stringToInt("5");
 *
 * // Returns null
 * stringToInt("5.5")
 *
 * // Returns null
 * stringToInt(5.5)
 */
export const stringToInt = (v: string | number): number | null =>
  typeof v === "string" ? (stringIsInteger(v) ? parseInt(v) : null) : isInteger(v) ? v : null;
