import React, { ReactElement } from "react";

import { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

import {
  IconCodeMap,
  IconNames,
  IconPrefixMap,
  Icons,
  IconCode,
  IconPrefix,
} from "application/config/configuration/fontAwesome/constants";

import { enumeratedLiterals, EnumeratedLiteralType } from "../../util/literals";
import * as types from "../types";

export * from "application/config/configuration/fontAwesome/constants";

export type IconLibrary = typeof Icons;

type IconNameReverseMap<N extends IconName> = keyof {
  [key in keyof IconLibrary as N extends IconLibrary[key][number]
    ? key
    : never]: IconLibrary[key][number];
};

export type GetIconPrefix<C extends IconCode> = C extends IconCode
  ? typeof IconPrefixMap[C]
  : never;

export type GetIconCode<T extends IconName> = IconNameReverseMap<T>;
export type GetIconCodeFromPrefix<T extends IconPrefix> = T extends IconPrefix
  ? typeof IconCodeMap[T]
  : never;

export type IconType = IconPrefix | IconCode;

/**
 * Represents the prefix, {@link IconPrefix}, or the code, {@link IconCode}, for a given Icon
 * name, {@link IconName}.  The code, {@link IconCode}, is simply a more intuitive, human readable
 * representation of the {@link IconPrefix} - which is usually a more obscure 3 character code that
 * FontAwesome uses.
 *
 * A given Font Awesome Icon has both a name, {@link IconName}, and a prefix {@link IconPrefix}. The
 * prefix ("far", "fab", "fas") indicates the form that the given name, {@link IconName}, is
 * included as in the icon registry.  For instance, you might have an Icon with a name
 * "exclamation-triangle" but only the "far" (regular) form of that Icon is included in our Icon
 * registry.
 *
 * But, a given name, {@link IconName}, can be associated with multiple prefixes, {@link IconPrefix}
 * - and by definition multiple codes, {@link IconCode}.  For instance, we may have an icon with
 * the name "exclamation-circle" that is included in the registry in both code = "regular" and
 * code = "solid" forms.
 *
 * For those cases, the Icon component will use a default code/prefix in the case that the `icon`
 * prop is provided as just the name, "exclamation-circle".  If a more specific form is needed,
 * the `icon` prop must be specified as, for example, ["regular", "exclamation-circle"].
 *
 * @see IconPrefix
 * @see IconCode
 */
export type IconName = EnumeratedLiteralType<typeof IconNames>;
export type GetIconName<C extends IconCode> = C extends IconCode ? IconLibrary[C][number] : never;

export type IconForName<
  N extends IconName = IconName,
  C extends GetIconCode<N> = GetIconCode<N>,
> = N extends IconName ? { type: C; name: N } : never;

export type IconForCode<
  C extends IconCode = IconCode,
  N extends GetIconName<C> = GetIconName<C>,
> = C extends IconCode ? { type: C; name: N } : never;

/**
 * Represents the information that is used to render an icon in the application.
 */
export type Icon<T extends IconCode = IconCode, N extends IconName = IconName> = T extends IconCode
  ? N extends GetIconName<T>
    ? IconForCode<T, N>
    : T extends GetIconCode<N>
    ? IconForName<N, T>
    : never
  : never;

/**
 * The element, {@link React.ReactElement}, that corresponds to the {@link JSX.Element} that is
 * rendered by the {@link Icon} component.
 *
 * This type definition will prevent against cases of that the `icon` prop, {@link IconProp}, can
 * be provided as another <Icon /> element recursively:
 *
 * const E: IconElement = <Icon icon={<Icon icon="slack" /> }/> // Allowed
 * const F: IconElement = <Icon icon={<Icon icon=<Icon icon={"slack"} /> /> }/> // Error
 */
export type IconElement = ReactElement<
  IconComponentProps,
  React.FunctionComponent<IconComponentProps>
>;

/**
 * Represents the ways in which an icon can be specified in the application, excluding the
 * {@link IconElement} itself.
 *
 * If provided as just the name, {@link IconName}, the {@link Icon} component will use a prefix,
 * {@link IconPrefix} (or code, {@link IconCode}) that is configured as the default and is
 * registered for the given {@link IconName}.  In cases where an {@link IconName} is registered
 * with multiple prefixes, the prop should be provided as an array of the prefix (or code) and
 * name: ["far", "exclamation-circle"] or ["regular", "exclamation-circle"].
 *
 * @see IconType
 */
export type BasicIconProp = IconName | Icon;

/**
 * The way that an "Icon" should be defined in the props for components in the application.
 *
 * A given component that accepts an `icon` (or similarly named) prop should allow it to be either:
 *
 * 1. A traditional specification, {@link BaseIconProp} - such as "slack" or ["brand", "slack"]
 *    <Button icon={"slack"} /> // Okay
 *
 * 2. Another icon element, {@link IconElement}:
 *
 *    <Button icon={<Icon className={"specific-icon"} /> } />
 */
export type IconProp = BasicIconProp | IconElement;

export const IconSizes = enumeratedLiterals(["small", "medium", "large", "fill"] as const);
export type IconSize = EnumeratedLiteralType<typeof IconSizes>;

export const IconColors = enumeratedLiterals(["brand", "grey", "blue", "white"] as const);
export type IconColor = EnumeratedLiteralType<typeof IconColors>;

export type BaseSVGProps = {
  /**
   * A string, "fit" or "square", that defines whether or not the `svg` element should fit snuggly
   * around the inner `path` element of the Icon or SVG ("fit") or the `svg` element should have a
   * 1-1 aspect ratio, with its inner `path` element being centered in the containing `svg`
   * ("square").
   *
   * Default: "square" (Defaulted in SASS)
   */
  readonly contain?: types.SizeContain;
  readonly color?: IconColor;
};

/**
 * Props that should be used for a component that renders an `svg` element, {@link SVGElement}, that
 * is not rendered via Font Awesome but rather SVG elements that are manually inserted into the
 * application.
 *
 * In the context that we are referring to an SVG vs. an Icon, the SVG is used to describe a
 * component that renders an `svg` element, {@link SVGElement}, directly (not through Font Awesome)
 * while an Icon refers to a component that renders an `svg` element via Font Awesome.
 *
 * The major difference between the two is that, due to internal mechanics that Font Awesome
 * implements, an Icon can change the sizing of the underlying `svg` element where as an SVG's
 * svg element is held at a constant size, which depends on the inner `path` drawing.
 *
 * For this reason, the props, {@link SVGProps}, do not include the `size` and `axis` props that are
 * included with the {@link Icon} component's props, {@link IconProps}, because when we are using a
 * component to render an {@link SVGElement} in the application, that {@link SVGElement} is imported
 * manually and has a preset size that cannot be altered.
 *
 * However, the `contain` prop is still applicable, because in the case that the contain is
 * "square", the {@link SVGElement} can be padded such that it has a 1-1 aspect-ratio while still
 * maintaining the size of its inner `path`.
 */
export type SVGProps = types.ComponentProps<
  BaseSVGProps & {
    readonly children: JSX.Element;
    readonly style?: Omit<
      types.Style,
      // See comment below related to the sizing of an SVG.
      | types.CSSSizeProperties
      | types.CSSDirectionalProperties<"padding">
      | "color"
      /* Setting the height or width values on an SVG is not allowed, since the SVGs that are
         manually included in this application have preset sizes and altering the size related
         properties will cause the SVG's Path to either be cutoff or be smaller than the SVG
         container. */
      | types.CSSSizeProperties
    >;
  },
  /*
  When we include an SVG in the application, it is included as a component that is assigned a
  given "name".  That "name" corresponds to a variable in SASS that defines what the height and
  width of the SVG being rendered are.  These base dimensions are used to size the SVG
  appropriately, particularly in cases where the `contain` prop is defined as "square".
  An SVG that is rendered in the application outside of Font Awesome will have a constant size,
  determined by the coordinates and of the various SVG elements that comprise the SVG's `path`.
  The SVG size cannot be dynamically changed, so properties related to the size of the SVG cannot
  be provided as props.
  */
  { external: Omit<React.SVGAttributes<SVGElement>, "fill" | "height" | "width" | "viewBox"> }
>;

type _BaseIconProps = types.ComponentProps<
  BaseSVGProps & {
    /**
     * The size of the Icon, provided as either as a valid CSS specification {@link CSSSize},
     * a standardized Icon size {@link IconSize}.
     *
     * (1) Valid CSS Specification {@link types.CSSSize<number | "px">}
     *     The size that the icon should have in the direction defined by the `axis` prop, either as
     *     a pixel value or a number (which is treated as a pixel value).  If the prop `contain`
     *     is provided as "square" - the sizing `axis` becomes irrelevant and the icon will be sized
     *     in both dimensions according to the provided size.
     *
     * (2) Standard Icon Size {@link IconSize}
     *     The size that the icon should have in the direction defined by the `axis` prop, defined
     *     as a standardized size string, {@link IconSize}, represented as a string "small",
     *     "medium", "large" or "fill".
     *
     *     - small, medium or large
     *       Standardized size names that map to a concrete numeric pixel size value in SASS.
     *
     *     - fill
     *       The Icon will grow in the direction specified by the `axis` prop, maintaining its
     *       aspect ratio, until either the width or height meets the edges of the parent container.
     *
     *       As a by-product of the center positioning of the Icon element and the manner in which
     *       the Icon's aspect-ratio and size in any dimension is related, the Icon will always be
     *       vertically centered if the axis is "vertical", and horizontally centered if the axis is
     *       "horizontal".
     *
     *       When the "size" is "fill", the "axis" prop is irrelevant because the Icon will grow to
     *       the smaller of the parent's width and height.
     *
     * Default: "medium" (Defaulted in SASS)
     */
    readonly size?: IconSize;
    /**
     * The axis {@link Exclude<SizeAxis, "both">} that the Icon should be sized in based on the
     * provided `size` prop.  An Icon must maintain its aspect-ratio, so it cannot size in both
     * directions.
     *
     * Default: "vertical";
     */
    readonly axis?: Exclude<types.SizeAxis, "both">;
    readonly style?: Omit<
      types.Style,
      types.CSSSizeProperties | types.CSSDirectionalProperties<"padding"> | "color"
    >;
  },
  { external: Pick<FontAwesomeIconProps, "spin"> }
>;

/**
 * The props that the component responsible for rendering the Icon component, without the recursive
 * {@link IconElement} value allowed for the `icon` prop.
 */
export type IconComponentProps = _BaseIconProps & {
  readonly icon: BasicIconProp;
};

/**
 * The props that the <Icon /> component accepts, which allows the `icon` prop to be provided by
 * the traditional means, {@link BasicIconProp}, or a nested element, {@link IconElement}.
 */
export type IconProps = _BaseIconProps & {
  readonly icon: IconProp;
};
