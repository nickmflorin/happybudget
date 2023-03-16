import * as types from "./types";
import * as typeguards from "../util/typeguards";
import * as validators from "../util/validators";

export const isCSSSizeUnit = (value: string): value is types.CSSSizeUnit =>
  types.CSSSizeUnits.includes(value as types.CSSSizeUnit);

/**
 * A typeguard that returns whether or not the provided value, {@link v}, is a valid CSS compatible
 * specification of an element's size for a size-related property (i.e. height, width, minWidth,
 * ...).
 *
 * This determination is made based on the type {@link types.CSSSize} - which does not include
 * all possible values that can be used to specify a CSS property related to the element's size,
 * but only pertinent that will want to account for.
 *
 * @see {@link types.CSSSize}
 *
 * @example
 * // Returns true
 * isCSSSize("100vh");
 *
 * @example
 * // Returns true
 * isCSSSize(10) or isCSSSize("10");
 *
 * @example
 * // Returns false
 * isCSSSize("large");
 *
 *
 * @param {string | number | null | undefined} value
 *   A primitive value for which the determination of whether or not it is a valid CSS size property
 *   will be made.
 *
 * @returns {value is types.CSSSize}
 */
export const isCSSSize = (value: string | number): value is types.CSSSize => {
  if (
    typeof value === "number" ||
    (typeof value === "string" && typeguards.stringIsInteger(value))
  ) {
    return true;
  }
  return validators.validateAny(
    /* The slice is a workaround in TS to allow the readonly array CSSSizeUnits (readonly string[])
       to be treated as just string[]. */
    types.CSSSizeUnits.slice(),
    (tail: types.CSSSizeUnit) => {
      if (tail.length === 0) {
        throw new Error("CSS Units cannot be empty strings.");
      }
      return (
        value.endsWith(tail) &&
        typeguards.stringIsInteger(value.slice(0, Math.max(tail.length - 1, 1)))
      );
    },
  );
};
