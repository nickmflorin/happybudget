import * as types from "./types";

/**
 * A typeguard that returns whether or not the provided string, {@link v}, is simply an integer
 * number in string form (i.e. "5").  While this is a typeguard, it should be noted that the
 * while the typeguard guards against cases where the quoted number is an integer, the typeguard
 * returns as {@link v is types.StringNumber}, which is not exactly the same...
 *
 * In TypeScript, we cannot differentiate between NaN, a float-type number or an integer-type
 * number - they are all assignable to {@link number}.  But, this function will only return `true`
 * if and only if the value is an integer in a string form:
 *
 * @example
 * stringIsInteger("5"); // true
 * stringIsInteger("5.1"); // false
 *
 * @param {string} v
 *   The value for which the determination should be made as to whether or not it is a string form
 *   of an integer value.
 *
 * @returns {v is types.StringNumber}
 */
export const stringIsInteger = (v: string): v is types.StringNumber =>
  /* Note that in this case, if the second conditional is Ndumber(v) === parseInt(v), the method
     will return true for cases where the integer in the string is preceeded by leading 0's
     (i.e. "005"). */
  !isNaN(Number(v)) && `${parseInt(v)}` == v;
