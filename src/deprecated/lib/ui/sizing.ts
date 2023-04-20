export type Dimension = { readonly width?: number; readonly height?: number };

export type StandardSize = "xsmall" | "small" | "medium" | "standard" | "large" | "xlarge";

/**
 * The props that are used to dictate size in a flexible manner.  The generic
 * type T defines the different size options dictated as boolean values and the
 * generic type S defines the prop that can be supplied to dictate the size as
 * a string.
 *
 * Ex) UseSizeProps<"small" | "medium", "size">
 *     >>> { size: "small" } or { size: "medium" } or { medium: true } or ...
 */
export type UseSizeProps<T extends string = StandardSize, S extends string = "size"> = {
  [key in S]?: T;
} & { [key in T]?: boolean };
