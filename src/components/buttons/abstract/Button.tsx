import React, { ForwardedRef, useMemo } from "react";

import classNames from "classnames";

import * as buttons from "lib/ui/buttons/types";
import * as tooltip from "lib/ui/tooltip/types";
import * as ui from "lib/ui/types";
import { Link, LinkProps } from "components/compat";
import { ConditionalTooltip } from "components/tooltips";

type _ClickableProps<V extends buttons.ButtonVariant = buttons.ButtonVariant> =
  ui.ComponentProps & {
    readonly children: string | JSX.Element;
    readonly style?: Omit<ui.Style, "backgroundColor" | "color" | ui.CSSSizeProperties>;
    readonly variant?: V;
    readonly size?: buttons.ButtonSize;
    /**
     * Sets the element in a "locked" state, which is a state in which the non-visual
     * characteristics of the "disabled" state should be used, but the element should not be styled
     * as if it is disabled.
     *
     * This prop should be used for cases where the click behavior of the element should be
     * restricted, but we do not want to treat the element, visually, as being disabled.  For
     * instance, if the element is in a "loading" state, we do not want it to look as if it is
     * disabled - but we do not want to allow click events.
     */
    readonly locked?: boolean;
    readonly loading?: boolean;
    readonly tooltip?: tooltip.Tooltip;
    readonly cornerStyle?: buttons.ButtonCornerStyle;
  };

export type ButtonProps<V extends buttons.ButtonVariant = buttons.ButtonVariant> =
  _ClickableProps<V> & {
    /**
     * The {@link ForwardedRef} that can be optionally passed through to the underlying
     * {@link HTMLButtonElement}.
     *
     * It is important that this prop is exposed on the button element that is wrapped around
     * "next/link"'s {@link Link} component, and is necessary for them to work together properly.
     */
    readonly ref?: ForwardedRef<HTMLButtonElement>;
  } & Pick<ui.HTMLElementProps<"button">, "onClick" | "onFocus" | "onBlur" | "disabled" | "type">;

export type AnchorProps<V extends buttons.ButtonVariant = buttons.ButtonVariant> =
  _ClickableProps<V> & {
    /**
     * The {@link ForwardedRef} that can be optionally passed through to the underlying
     * {@link HTMLButtonElement}.
     *
     * It is important that this prop is exposed on the button element that is wrapped around
     * "next/link"'s {@link Link} component, and is necessary for them to work together properly.
     */
    readonly ref?: ForwardedRef<HTMLAnchorElement>;
    /* An HTMLAnchorElement does not have a "disabled" prop - so we will have to mimic disabled
     behavior via a class name. */
    readonly disabled?: boolean;
    /**
     * Defines the href that the anchor should link to.
     */
    readonly to?: LinkProps["href"];
  } & Pick<ui.HTMLElementProps<"a">, "onFocus" | "onBlur" | "onClick">;

const useClickableProps = <V extends buttons.ButtonVariant = buttons.ButtonVariant>(
  props: Omit<_ClickableProps<V>, "children"> & { readonly disabled?: boolean },
) =>
  useMemo(
    () => ({
      className: classNames(
        "button",
        /* For cases where the element is an HTMLAnchorElement, we will need to define the disabled
           class name such that the disabled behavior can be "mocked". */
        { disabled: props.disabled },
        { "button--locked": props.locked === true || props.loading === true },
        { "button--loading": props.loading === true },
        `button--corner-style-${props.cornerStyle || buttons.ButtonCornerStyles.NORMAL}`,
        props.variant !== undefined && `button--${props.variant}`,
        props.size !== undefined && `button--${props.size}`,
        props.className,
      ),
    }),
    [
      props.size,
      props.locked,
      props.loading,
      props.variant,
      props.className,
      props.disabled,
      props.cornerStyle,
    ],
  );

export const Button = <V extends buttons.ButtonVariant = buttons.ButtonVariant>({
  onClick,
  disabled,
  locked,
  loading,
  variant,
  children,
  size,
  tooltip,
  ...props
}: Omit<ButtonProps<V>, "to">): JSX.Element => {
  const ps = useClickableProps({ ...props, disabled, variant, locked, loading, size });

  /* The onClick should be overridden to prevent click behavior when the element is disabled just
     in case the "disabled" class is being used and the SASS style does not remove pointer events
     from the element. */
  const _onClick = useMemo(
    () => (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled !== true && locked !== true) {
        onClick?.(e);
      }
    },
    [onClick, disabled, locked],
  );

  return (
    <ConditionalTooltip tooltip={tooltip}>
      <button type="button" {...props} {...ps} onClick={_onClick} disabled={disabled}>
        <div className="button__content">{children}</div>
      </button>
    </ConditionalTooltip>
  );
};

const BaseAnchor = <V extends buttons.ButtonVariant = buttons.ButtonVariant>({
  onClick,
  disabled,
  variant,
  locked,
  loading,
  children,
  size,
  tooltip,
  ...props
}: Omit<AnchorProps<V>, "to">): JSX.Element => {
  const ps = useClickableProps({ ...props, disabled, variant, locked, loading, size });

  /* The onClick should be overridden to prevent click behavior when the element is disabled just
     in case the "disabled" class is being used and the SASS style does not remove pointer events
     from the element. */
  const _onClick = useMemo(
    () => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled !== true && locked !== true) {
        onClick?.(e);
      }
    },
    [onClick, disabled, locked],
  );

  return (
    <ConditionalTooltip tooltip={tooltip}>
      <a {...props} {...ps} onClick={_onClick}>
        <div className="button__content">{children}</div>
      </a>
    </ConditionalTooltip>
  );
};

/**
 * The abstract base component for all of the various forms of an anchor in the application.  This
 * abstract class should never be used directly in the application, outside of other isolated anchor
 * components extending it.
 *
 * All anchor components in the application should have this component at the root of its component
 * ancestry tree.
 *
 * Styling
 * -------
 * @see {Button}
 *
 * Href
 * ----
 * @see {Button}
 */
export const Anchor = <V extends buttons.ButtonVariant = buttons.ButtonVariant>({
  to,
  ...props
}: AnchorProps<V>): JSX.Element =>
  to === undefined ? (
    <BaseAnchor<V> {...props} />
  ) : (
    <Link href={to} passHref>
      <BaseAnchor<V> {...props} />
    </Link>
  );
