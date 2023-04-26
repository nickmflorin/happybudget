import React, { useMemo } from "react";

import classNames from "classnames";

import { logger } from "internal";
import * as ui from "lib/ui/types";

import * as icons from "lib/ui/icons";
import { Icon } from "components/icons";

export type SpinnerProps = Omit<icons.IconProps, "axis" | "contain" | "icon" | "size" | "spin"> & {
  readonly size?: ui.CSSSize<number | "px"> | ui.SpinnerSize;
  readonly loading?: boolean | undefined;
  /**
   * A flag that, when explicitly provided as false, will avoid removing the element from the DOM
   * when it is not loading and instead just "hide" it.
   *
   * When the Spinner is "hidden" instead of removed from the DOM, the space that it had reserved
   * on the screen remains - which is a method in which the horizontal or vertical shifting or
   * elements adjacent to the Spinner whenever the Spinner toggles loading state can be avoided.
   *
   * This should be used for cases where the horizontal or vertical alignment of items next to,
   * above or below the Spinner needs to remain the same, regardless of whether or not the
   * Spinner is loading.
   *
   * This flag is only applicable when a `fallbackIcon` is not provided.  When a `fallbackIcon` is
   * provided, this prop is treated as being `false` by default.
   */
  readonly destroyAfter?: false;
  /**
   * An Icon that should be shown in place of the Spinner when the loading state is false.
   *
   * The Icon will be perfectly sized and positioned the same way as the Spinner such that the
   * toggling between the Icon and the Spinner in the view, depending on the loading state, does
   * not cause HTML elements near the component to shift around.
   */
  readonly fallbackIcon?: icons.IconProp;
  /**
   * A custom render function that can be used to render an independent indicator when in a loading
   * state.
   */
  readonly render?: (props: RenderProps) => JSX.Element;
};

export type RenderProps = ui.ComponentProps;

export const _Spinner = ({
  size,
  loading,
  fallbackIcon,
  destroyAfter,
  render,
  ...props
}: SpinnerProps): JSX.Element => {
  const _destroyAfter = useMemo(() => {
    if (fallbackIcon !== undefined && destroyAfter !== undefined) {
      logger.warn("The 'destroyAfter' prop is not applicable when a 'fallbackIcon' is provided.");
      return true;
    }
    return !(destroyAfter === false);
  }, [destroyAfter, fallbackIcon]);

  /* useEffect(() => {
       if ((fallbackIcon !== undefined || destroyAfter !== undefined) && render !== undefined) {
         logger.warn(
           "The 'destroyAfter' prop and/or the `fallbackIcon` prop cannot be used with a custom " +
             "render prop.",
         );
       }
     }, [destroyAfter, fallbackIcon, render]); */

  const style = useMemo(
    () =>
      /* If the destroyAfter prop is explicitly set to false, we do not want to remove the Spinner
         from the DOM when it is not loading, but we want to just hide the loading indicator,
         allowing the space that it previously took up to still be in the DOM. */
      !loading && _destroyAfter ? { ...props.style, opacity: 0 } : props.style,
    [props.style, loading, _destroyAfter],
  );

  const className = useMemo(
    () =>
      classNames(
        "icon--spinner",
        size !== undefined && `icon--spinner--size-${size}`,
        props.className,
      ),
    [props.className, size],
  );

  if (render !== undefined) {
    /* The render method is only applicable for rendering an indicator in the loading state. It is
       not provided the mutated style because the mutated style is only applicable if destroyAfter
       is false, and destroyAfter is not applicable for the render callback. */
    return loading ? render({ style: props.style, id: props.id, className }) : <></>;
  } else if (loading || !_destroyAfter) {
    return (
      <Icon
        color={icons.IconColors.BRAND}
        {...props}
        style={style}
        spin={loading}
        icon={icons.IconNames.CIRCLE_NOTCH}
        contain={ui.SizeContains.SQUARE}
        className={className}
      />
    );
  } else if (!loading && fallbackIcon !== undefined) {
    return (
      <Icon
        color={icons.IconColors.BRAND}
        {...props}
        contain={ui.SizeContains.SQUARE}
        className={className}
        style={props.style}
        spin={false}
        icon={fallbackIcon}
      />
    );
  }
  return <></>;
};

export const Spinner = React.memo(_Spinner);
