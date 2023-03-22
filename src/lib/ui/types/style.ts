import { enumeratedLiterals, EnumeratedLiteralType, StringHasLength } from "../../util";

export type FontFamily = "AvenirNext" | "Roboto";

export type FontWeight = 300 | 400 | 500 | 600 | 700;
export type FontWeightName = "Bold" | "Regular" | "Light" | "SemiBold" | "Medium";

export type FontVariant = FontWeightName | { weight: FontWeightName; hasItalic?: boolean };

export type Font = { family: FontFamily; weight: FontWeightName; italic?: boolean };

export type FontFace = { family: FontFamily; variants: FontVariant[] };

export type Breakpoint = 320 | 480 | 768 | 1024 | 1200 | 1580;
export type BreakpointId = "small" | "medium" | "large" | "xl" | "xxl" | "xxxl";

export type Breakpoints = Record<BreakpointId, Breakpoint>;

export const CSSSizeUnits = ["px", "%", "rem", "em", "vh", "vw"] as const;
export type CSSSizeUnit = typeof CSSSizeUnits[number];

/**
 * Represents a valid CSS size specification that may be provided to a given component's props.
 *
 * This type is not meant to be used to represent all CSS size specifications that can exist
 * in a component's style, {@link ui.types.Style}.  Instead, it is meant to be used as a specific
 * prop that a component may expose, such as `size`.
 *
 * Accounting for all possible valid CSS values that can be used to specify dimension is not
 * feasible - but this type represents the types that we will most likely see and should allow.
 */
export type CSSSize<E extends CSSSizeUnit | number | undefined = undefined> = E extends number
  ? number | `${number}`
  : E extends CSSSizeUnit
  ? `${number}${E}`
  : CSSSize<number> | CSSSize<CSSSizeUnit>;

export const SizeDimensions = enumeratedLiterals(["width", "height", "both"] as const);

/**
 * Represents the various dimensions that the props for a component can dictate the component's
 * size, when provided as prop that is separate from style, {@link ui.types.Style}.
 */
export type SizeDimension = EnumeratedLiteralType<typeof SizeDimensions>;

type _CSSFontPrefixedProperties = "weight" | "size" | "style" | "family";

export type CSSFontProperties =
  | `font${Capitalize<_CSSFontPrefixedProperties>}`
  | "lineHeight"
  | "color";
export const SizeAxes = enumeratedLiterals(["horizontal", "vertical", "both"] as const);

/**
 * Represents the various x-y axes that the props for a component can dictate when specifying how
 * the component should size.  Each {@link SizeAxis} corresponds to a specific
 * {@link SizeDimension}, and can be used to specify the {@link SizeDimension} that should be used
 * for a given size specification.
 */
export type SizeAxis = EnumeratedLiteralType<typeof SizeAxes>;

export const SizeAxisMap: { [key in SizeAxis]: SizeDimension } = {
  both: "both",
  vertical: "height",
  horizontal: "width",
};

export const SizeContains = enumeratedLiterals(["fit", "square"] as const);
export type SizeContain = EnumeratedLiteralType<typeof SizeContains>;

export const CSSDirections = enumeratedLiterals(["top", "bottom", "left", "right"] as const);
export type CSSDirection = EnumeratedLiteralType<typeof CSSDirections>;

/**
 * A generic type that results in the {@link SizeDimension} that is associated with axis,
 * {@link SizeAxis}, specified via the generic type argument {@link D}.
 */
export type ToSizeDimension<D extends SizeDimension | SizeAxis> = D extends Exclude<
  SizeAxis,
  "both"
>
  ? {
      horizontal: "width";
      vertical: "height";
    }[D]
  : "height" | "width";

export type CSSDirectionalProperties<S extends string> =
  | Lowercase<S>
  | `${Lowercase<S>}${Capitalize<CSSDirection>}`;

/**
 * Represents the names of the various CSS properties that are related to the sizing of a given
 * element, via the "height" and/or "width" dimensions, {@link SizeDimension}.
 *
 * If the type is not provided with a generic type argument, {@link D} - the specific dimension
 * {@link SizeDimension}, the type results in the size related CSS properties for both dimensions.
 * Otherwise, it represents the size related CSS properties for the specified dimension, {@link D}.
 *
 * This type, {@link CSSSizeProperties}, is meant to be used when the sizing of a component is being
 * controlled by other props or other means, and the component's `style` prop {@link ui.types.Style}
 * needs to exclude the related properties such that they do not conflict.
 *
 * @example
 * CSSSizeNames<"height">; // "minHeight" | "maxHeight" | "height";
 *
 * @example
 * CSSSizeProperties; // "minHeight" | "minWidth" | "maxHeight" | "maxWidth" | "height" | "width";
 */
export type CSSSizeProperties<D extends SizeDimension | SizeAxis = SizeDimension | SizeDimension> =
  | ToSizeDimension<D>
  | `${"min" | "max"}${Capitalize<ToSizeDimension<D>>}`;

/**
 * Either an alias type for a HEX color code with the prefixed `#` when the type argument {@link T}
 * is not provided, or an enforced type when the type argument {@link T} is provided.
 *
 * When we need to define the type of a string that should be a HEX color code, we can simply use
 * this type with no type argument:
 *
 *   type Style = Omit<React.CSSProperties, "color"> & { color: HexColor };
 *
 * Unfortunately, while string literals in Typescript are incredibly useful, they are still in their
 * early stages - and it is not possible to create a type for a string that must be of the form
 * of a HEX color code outside of the fact that it must be prefixed with the `#` character:
 *
 *   type HexColor; // `#${string}`
 *
 * This means that the following will also be assignable to HexColor: (1) "##5995fA", (2) "#!",
 * (3) "#" - basically anything that is a string that exists after the `#`.
 *
 * The only way to do this would involve a very, very deeply nested recusion over a large number of
 * string characters which cannot be handled by the TS server (and shouldn't be for that matter).
 *
 * What we can do however, is more strictly ensure that a known type is a HEX color code, in the
 * sense that it leads with a `#`, does not contain another `#`, and only has 6 characters after
 * the `#`.
 *
 *   const colorFunction<T extends string> = (v: HexColor<T>) => {...}
 *   colorFunction("FFFEEE") // Error
 *   colorFunction("#FFFEEE") // Ok
 *   colorFunction("#F9#444") // Error
 */
export type HexColor<T extends string = "__PHANTOM__"> = T extends "__PHANTOM__"
  ? `#${string}`
  : T extends `#${infer P extends string}`
  ? P extends HexColor<P>
    ? never
    : P extends `${string}#${string}`
    ? never
    : StringHasLength<P, 6> extends true
    ? `#${P}`
    : never
  : StringHasLength<T, 6> extends true
  ? `#${T}`
  : never;
