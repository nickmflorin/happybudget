import { enumeratedLiterals } from "../../util/literals";
import { EnumeratedLiteralType } from "../../util/types/literals";
import * as icons from "../icons";
import * as tooltip from "../tooltip";
import { ComponentProps } from "../types";

export type LinkObj = {
  readonly text?: string;
  readonly to?: string;
  readonly onClick?: () => void;
};

export type IncludeLinkParams = {
  readonly setLoading: (v: boolean) => void;
  readonly history: import("history").History<unknown>;
};

export type IncludeLinkFn = (p: IncludeLinkParams) => LinkObj;
export type IncludeLink = IncludeLinkFn | LinkObj;

export type ClickableIconCallbackParams = {
  readonly isHovered: boolean;
  readonly iconProps?: Omit<icons.IconComponentProps, "icon">;
};

export type ClickableIconCallback = (params: ClickableIconCallbackParams) => icons.IconProp;
export type ClickableIconOrElement = icons.IconProp | ClickableIconCallback;

export type ClickableProps = ComponentProps<{
  readonly disabled?: boolean;
  readonly tooltip?: tooltip.Tooltip;
  readonly icon?: ClickableIconOrElement;
}>;

/**
 * Defines the various base variants, or forms, that a given button and/or anchor can exist in.
 *
 * In regard to buttons and/or anchors, the term "variant" is used to describe a specific set of
 * styling behavior that is unique to the buttons and/or anchors that are described with that
 * "variant".  A "base variant", {@link ButtonVariant}, describes the top level variants that a
 * button and/or anchor can exist in.
 *
 * There are some cases where a button and/or anchor is associated with both a base variant,
 * {@link ButtonVariant}, and a sub-variant of that base variant (i.e. {@link ButtonActionVariant}).
 * In these cases, the sub-variant simply defines variations in styling behavior that extends off
 * of the styling behavior defined by the base variant.
 */
export const ButtonVariants = enumeratedLiterals(["solid", "alternate", "action"] as const);
export type ButtonVariant = EnumeratedLiteralType<typeof ButtonVariants>;

export const ButtonSizes = enumeratedLiterals(["small", "medium", "large"] as const);
export type ButtonSize = EnumeratedLiteralType<typeof ButtonSizes>;

export const ButtonActionVariants = enumeratedLiterals(["primary", "secondary", "bare"] as const);
export type ButtonActionVariant = EnumeratedLiteralType<typeof ButtonActionVariants>;

export const ButtonSolidVariants = enumeratedLiterals([
  "primary",
  "secondary",
  "bare",
  "danger",
  "white",
] as const);
export type ButtonSolidVariant = EnumeratedLiteralType<typeof ButtonSolidVariants>;

export const ButtonAlternateVariants = enumeratedLiterals(["link", "danger"] as const);
export type ButtonAlternateVariant = EnumeratedLiteralType<typeof ButtonAlternateVariants>;

export const ButtonCornerStyles = enumeratedLiterals(["rounded", "square", "normal"] as const);
export type ButtonCornerStyle = EnumeratedLiteralType<typeof ButtonCornerStyles>;
