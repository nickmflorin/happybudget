import React from "react";

import { Subtract } from "utility-types";

import * as icons from "lib/ui/icons";

import { useSVG } from "../hooks";

const XMLNS = "http://www.w3.org/2000/svg";

type InternalSVGProps = {
  readonly __defaults__: {
    readonly name: string;
    readonly color: icons.IconColor;
  };
};

type SVGProps<P extends icons.SVGProps = icons.SVGProps> = P & InternalSVGProps;

export type SVG<P extends SVGProps = SVGProps> = React.FunctionComponent<
  Omit<Subtract<P, InternalSVGProps>, "children">
>;

const _SVG = ({ children, contain, color, __defaults__, ...props }: SVGProps) => {
  const svgProps = useSVG(__defaults__.name, {
    ...props,
    contain,
    color: color || __defaults__.color,
  });
  return (
    <svg xmlns={XMLNS} {...props} {...svgProps}>
      {children}
    </svg>
  );
};

const _MemoizedSVG = React.memo(_SVG);

/**
 * A component factory that creates components that render a {@link React.SVGSVGElement} *only*.
 *
 * When a custom SVG is added to the application (i.e. it is not rendered via Font Awesome), it
 * should be componentized via this factory method.  The factory method should be provided with
 * the SVG's default color as well as the SVG's name - which should uniquely describe the specific
 * SVG being rendered.
 *
 * The SVG's name will be used to set a unique class name on the rendered SVG element such that
 * the sizing properties of that SVG can be set in SASS.
 *
 * @example
 * export const MyCustomSVG = createSVG(
 *   <path>{...}</path>,
 *   { defaultColor: icons.IconColors.WHITE, name: "my-custom-svg"}
 * );
 */
export const createSVG = <P extends SVGProps = SVGProps>(
  children: React.ReactElement<JSX.IntrinsicElements["svg"]["path"]>,
  options: { readonly name: string; readonly defaultColor: icons.IconColor },
): SVG<P> => {
  const SVGComponent = (props: Omit<Subtract<P, InternalSVGProps>, "children">) => (
    <_MemoizedSVG {...props} __defaults__={{ ...options, color: options.defaultColor }}>
      {children}
    </_MemoizedSVG>
  );
  return Object.assign(SVGComponent, { displayName: "SVG" });
};
