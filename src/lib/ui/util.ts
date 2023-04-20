import { logger } from "internal";

import { parsers, stringIsInteger } from "../util";

import { isCSSSizeUnit } from "./typeguards";
import * as types from "./types";

type ParseSizeOptions = {
  readonly strict?: false;
};

type ParseSizeReturn<U extends types.CSSSizeUnit | number, O extends ParseSizeOptions> = O extends {
  readonly strict: false;
}
  ? [number, U] | number | null
  : [number, U] | number;

// TODO: Convert to a Zod Schema
export const parseSize = <U extends types.CSSSizeUnit | number, O extends ParseSizeOptions>(
  size: string | number,
  options?: O,
): ParseSizeReturn<U, O> => {
  if (typeof size === "number") {
    return size as ParseSizeReturn<U, O>;
  } else if (stringIsInteger(size)) {
    return parsers.parseInteger(size) as ParseSizeReturn<U, O>;
  } else {
    for (const key of types.CSSSizeUnits) {
      if (size.endsWith(key)) {
        const stringNumber = size.slice(0, size.length - key.length);
        const unit = size.slice(size.length - key.length);
        /* We only want to throw an error for an invalid unit if the first portion of the string is
           in fact a number - this avoids errors that would arise from a unit that is a substring of
           another unit. */
        if (stringIsInteger(stringNumber)) {
          if (!isCSSSizeUnit(unit)) {
            if (options?.strict === false) {
              return null as ParseSizeReturn<U, O>;
            }
            throw new Error(
              `The provided size '${size}' does not have a valid CSS unit, '${unit}'.`,
            );
          }
          return [parsers.parseInteger(stringNumber) as number, unit as U] as ParseSizeReturn<U, O>;
        }
      }
    }
    if (options?.strict === false) {
      return null as ParseSizeReturn<U, O>;
    }
    throw new Error(`The provided size '${size}' is not valid.`);
  }
};

/**
 * Alters the numeric value of the provided size, {@link types.CSSSize}, while maintaining the
 * unit, {@link types.CSSSizeUnit}, that it represents.
 *
 * @example
 * // Returns "5px"
 * alterCSSSize("4px", (v: number) => v + 1);
 *
 * @param {@types.CSSSize} size
 *   The size value that should be altered, with or without a unit.
 *
 * @param {(v: number) => number} alteration
 *   The method that defines how the numeric size value of the provided size string, `size`, should
 *   be altered.
 *
 * @returns {types.CSSSize}
 *   The size, {@link types.CSSSize}, with the numeric value altered based on the provided
 *   `alteration` with the same unit that the original value, 'size', had.
 */
export const alterCSSSize = <E extends types.CSSSize<U>, U extends types.CSSSizeUnit | number>(
  size: E,
  alteration: (v: number) => number,
): E => {
  const parsed = parseSize(size);
  const numeric = typeof parsed === "number" ? parsed : parsed[0];
  return typeof parsed === "number"
    ? typeof size === "string"
      ? (`${alteration(numeric)}` as E)
      : (alteration(numeric) as E)
    : (`${alteration(numeric)}${parsed[1]}` as E);
};

type SafelyMergeProvidedStyleReturnType<
  P extends types.Style | undefined,
  A extends types.Style | undefined,
> = P extends undefined ? (A extends undefined ? undefined : A) : P;

/**
 * Merges the additional styles {@link types.Style} into the provided styles {@link types.Style}
 * in the case that a component is updating the object defined by the `style` property of the
 * {@link ComponentProps} that are provided to the component, logging cases where the properties
 * are being altered/overwritten.
 *
 * @param {types.Style | undefined} provided
 *   The value of the `style` prop provided to the component externally.
 *
 * @param {types.Style | undefined}  additional
 *   Additional attributes of the {@link types.Style} object that will be merged into the
 *   {@link types.Style} object that was provided to the component externally.
 *
 * @returns {types.Style | undefined}
 *   The merged {@link types.Style} object, with the style attributes defined by the `additional`
 *   parameter overwriting those defined by the `provided` parameter.
 */
export const safelyMergeIntoProvidedStyle = <
  P extends types.Style | undefined,
  A extends types.Style | undefined,
>(
  provided: P,
  additional: A,
): SafelyMergeProvidedStyleReturnType<P, A> => {
  if (additional === undefined) {
    return provided as SafelyMergeProvidedStyleReturnType<P, A>;
  } else if (provided === undefined) {
    return additional as SafelyMergeProvidedStyleReturnType<P, A>;
  }
  return Object.keys(additional).reduce((prev: types.Style, name: string) => {
    const styleName = name as keyof types.Style;
    if (additional[styleName] !== undefined) {
      if (provided[styleName] !== undefined) {
        logger.warn(
          { name, previous: provided[styleName], new: additional[styleName] },
          `The style property '${styleName}' was explicitly provided as '${provided[styleName]} ' +
        'but is being overwritten as '${additional[styleName]}'.`,
        );
      }
      return { ...prev, [name]: additional[styleName] };
    }
    return prev;
  }, provided) as SafelyMergeProvidedStyleReturnType<P, A>;
};

export const getOppositeDirection = <T extends types.CSSDirection>(
  v: T,
): types.OppositeCSSDirection<T> =>
  ({
    [types.CSSDirections.UP]: types.CSSDirections.DOWN,
    [types.CSSDirections.DOWN]: types.CSSDirections.UP,
    [types.CSSDirections.LEFT]: types.CSSDirections.RIGHT,
    [types.CSSDirections.RIGHT]: types.CSSDirections.LEFT,
  }[v]);

export function getOppositeAxisOrDimension(v: types.SizeAxis): types.SizeAxis;

export function getOppositeAxisOrDimension(v: types.SizeDimension): types.SizeDimension;

/**
 * Returns the opposite {@link types.SizeAxis} or {@link types.SizeDimension} for the provided
 * {@link types.SizeAxis} or {@link types.SizeDimension}, depending on which type is provided.
 *
 * @param {types.SizeAxis | types.SizeDimension} value
 *   The axis or dimension, excluding the case of "both", that the opposite axis or dimension should
 *   be returned in regard to.
 *
 * @returns {types.SizeAxis | types.SizeDimension}
 *   The opposite axis of the provided axis, in the case an axis was provided, or the opposite
 *   dimension of the provided dimension, in the case a dimension was provided.
 */
export function getOppositeAxisOrDimension(
  value: types.SizeAxis | types.SizeDimension,
): types.SizeAxis | types.SizeDimension {
  if ([types.SizeDimensions.BOTH, types.SizeAxes.BOTH].includes(value as "both")) {
    logger.warn(
      `The provided axis/dimension ${value} is not associated with an opposite dimension.`,
    );
    return value;
  } else if (types.SizeAxes.contains(value)) {
    return value === types.SizeAxes.VERTICAL ? types.SizeAxes.HORIZONTAL : types.SizeAxes.VERTICAL;
  }
  return value === types.SizeDimensions.HEIGHT
    ? types.SizeDimensions.WIDTH
    : types.SizeDimensions.HEIGHT;
}

/**
 * Returns the dimension, {@link types.SizeDimension} associated with the provided axis
 * {@link types.SizeAxis}. If the `opposite` option is provided as `true`, the opposite
 * {@link types.SizeDimension} will be returned, as long as the provided axis is not "dual".
 */
export const getSizeDimension = (a: types.SizeAxis, options?: { opposite?: boolean }) => {
  const dim = types.SizeAxisMap[a];
  if (options?.opposite === true) {
    return getOppositeAxisOrDimension(dim);
  }
  return dim;
};

/**
 * Returns the dimension, {@link types.SizeAxis} associated with the provided dimension
 * {@link types.SizeDimension}. If the `opposite` option is provided as `true`, the opposite
 * {@link types.SizeAxis} will be returned, as long as the provided dimension is not "both".
 */
export const getSizeAxis = (dim: types.SizeDimension, options?: { opposite?: boolean }) => {
  if (options?.opposite === true) {
    return getOppositeAxisOrDimension(dim);
  }
  return dim;
};

/**
 * Returns the style {@link types.Style} with the provided size {@link types.SizePropValues} defined
 * for the provided axis {@link types.SizeAxis}.
 */
export const sizeOnAxis = (
  style: types.Style | undefined,
  axis: types.SizeAxis,
  size: types.CSSSize,
): types.Style => {
  const dim = getSizeDimension(axis);
  return safelyMergeIntoProvidedStyle(
    style,
    dim === "both" ? { width: size, height: size } : { [dim]: size },
  ) as types.Style;
};
