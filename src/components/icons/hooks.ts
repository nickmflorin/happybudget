import { useMemo } from "react";

import classNames from "classnames";

import { ui } from "lib";

/**
 * A hook that provides the props that are common for both the Icon and SVG components.
 */
export const useIconOrSvg = <P extends ui.BaseSVGProps & { readonly className?: string }>(
  form: "icon" | "svg",
  props: P,
): Pick<P, "className"> =>
  useMemo(
    () => ({
      className: classNames(
        form,
        /* The modifier classes for color, contain and size should only be applied in the case that
           the associated prop is provided.  Otherwise, the properties associated with each prop
           will be defaulted in SASS based on default prop values defined in SASS. */
        props.color !== undefined && `${form}--color-${props.color}`,
        props.contain !== undefined && `${form}--contain-${props.contain}`,
        props.className,
      ),
    }),
    [form, props.color, props.contain, props.className],
  );

/**
 * A hook that provides the props that are common for the Icon component.
 */
export const useIcon = <P extends ui.IconProps>({
  className,
  ...props
}: Omit<P, "icon">): Pick<P, "className"> => {
  const baseProps = useIconOrSvg("icon", props);
  return useMemo(
    () => ({
      ...baseProps,
      className: classNames(
        baseProps.className,
        `icon--axis-${props.axis}`,
        props.size !== undefined && !ui.isCSSSize(props.size) && `icon--size-${props.size}`,
        className,
      ),
    }),
    [baseProps, props.size, className, props.axis],
  );
};

/**
 * A hook that provides the props that are common for the SVG component.
 */
export const useSVG = <P extends Omit<ui.SVGProps, "children">>(
  name: string,
  { className, ...props }: P,
): Pick<P, "className"> => {
  const baseProps = useIconOrSvg("svg", props);
  return useMemo(
    () => ({
      ...baseProps,
      className: classNames(baseProps.className, `svg--${name}`, className),
    }),
    [baseProps, className, name],
  );
};
