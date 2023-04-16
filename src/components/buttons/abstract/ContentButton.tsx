import React, { useMemo } from "react";

import classNames from "classnames";

import { logger } from "internal";
import { ui } from "lib";
import { CaretIcon } from "components/icons";
import { Spinner } from "components/loading";
import { ShowHide } from "components/util";

import { Button, ButtonProps, Anchor, AnchorProps } from "./Button";

export type TextVariant = Exclude<ui.ButtonVariant, typeof ui.ButtonVariants.ACTION>;

type Loc = Exclude<ui.CSSDirection, typeof ui.CSSDirections.UP | typeof ui.CSSDirections.DOWN>;

const ICON_DEFAULT_LOCATION: Loc = ui.CSSDirections.LEFT;
const CARET_DEFAULT_LOCATION: Loc = ui.CSSDirections.RIGHT;

type ContentButtonSubContentProps = {
  readonly children: string | JSX.Element;
  readonly loading?: boolean;
  readonly icon?: ui.IconProp;
  /**
   * Defines the direction that the caret should be pointed in, whether it be "up" or "down".
   */
  readonly dropdownCaretDirection?: Exclude<
    ui.CSSDirection,
    typeof ui.CSSDirections.LEFT | typeof ui.CSSDirections.RIGHT
  >;
  /**
   * Defines whether or not the button and/or anchor should include a caret icon, and if so, what
   * side of the text the caret should be placed.
   *
   * Values:
   *
   * 1. true
   *    Defining this prop as 'true' will cause the caret to appear in the button, but its location
   *    (to the left of or right of the text) will be determined based on the optionally provided
   *    'iconLocation' (or lack thereof).  The caret will always be placed on the opposite side of
   *    the icon, and if the 'icon' is not provided then the caret will be placed in its default
   *    location: to the right of the text;
   *
   * 2. "left" or "right"
   *    Defining the prop as 'left' or 'right' will cause the caret to appear on that side of the
   *    text unless its location conflicts with the location defined by the 'iconLocation' prop.
   *    If the two conflict, the 'iconLocation' prop will be favored, and the caret will be placed
   *    on the opposite side of the text that the icon is.
   */
  readonly dropdownCaret?: true | Loc;
  /**
   * Defines the location of the optionally provided 'icon' prop, relative to the text inside of the
   * button and/or anchor.
   */
  readonly iconLocation?: Loc;
};

const _Affix = (
  props: Omit<ContentButtonSubContentProps, "children" | "iconLocation">,
): JSX.Element => {
  const spinner = useMemo(
    () => (
      <Spinner
        className="icon-spinner--button"
        fallbackIcon={props.icon}
        loading={props.loading}
        size={ui.SpinnerSizes.FILL}
      />
    ),
    [props.icon, props.loading],
  );
  return <div className="button__icon-or-spinner-wrapper">{spinner}</div>;
};

const Affix = React.memo(_Affix);

type CaretLocation<I extends Loc | null> = I extends null
  ? Loc | null
  : I extends Loc
  ? ui.OppositeCSSDirection<I> | null
  : never;

type LoadingLocation<
  I extends Loc | null,
  C extends CaretLocation<I> = CaretLocation<I>,
> = I extends null ? (C extends null ? "left" : C) : I extends Loc ? I : never;

type LocationSet<
  I extends Loc | null,
  C extends CaretLocation<I> = CaretLocation<I>,
  L extends LoadingLocation<I, C> = LoadingLocation<I, C>,
> = {
  readonly icon: I;
  readonly caret: C;
  readonly loading: L;
};

type Location<L extends Loc = Loc> = L extends Loc
  ? /* In this case, the Icon/Loading indicator will be on the left side of the text, and the caret
       will be on the right side of the text. */
    | LocationSet<"left">
      /* In this case, the Icon/Loading indicator will be on the righy side of the text, and the
         caret will be on the left side of the text. */
      | LocationSet<"right">
      /* In these 2 case, there is no icon - and the caret/Loading indicator will be on the same
         side of the text, either the left or the right. */
      | LocationSet<null, "right">
      | LocationSet<null, "left">
      /* In these 2 cases, there is no caret - and the Icon/Loading indicator will be on the same
         side of the text, either the left or the right. */
      | LocationSet<"right">
      | LocationSet<"left">
      /* In this case, there is no caret and no icon - and the Loading indicator will be on the left
         side of the text. */
      | LocationSet<null, null>
  : never;

const getLocationSet = (
  props: Pick<ContentButtonSubContentProps, "iconLocation" | "dropdownCaret" | "icon">,
): Location => {
  if (props.iconLocation === undefined && props.dropdownCaret !== undefined) {
    if (props.dropdownCaret === true) {
      if (props.icon === undefined) {
        /* There is no icon, the loading indicator should be shown over the caret and the caret
           should be in the default location. */
        return { icon: null, loading: CARET_DEFAULT_LOCATION, caret: CARET_DEFAULT_LOCATION };
      }
      /* There is an icon and a caret, but neither locations are specified.  Each should be placed
         in its default location, and the loading indicator should be shown over the icon. */
      return {
        icon: ICON_DEFAULT_LOCATION,
        loading: ICON_DEFAULT_LOCATION,
        caret: CARET_DEFAULT_LOCATION,
      };
    }
    if (props.icon === undefined) {
      /* There is no icon, the loading indicator should be shown over the caret and the caret should
         be in the location dictated by the prop. */
      return {
        icon: null,
        loading: props.dropdownCaret,
        caret: props.dropdownCaret,
      } as LocationSet<null, "left"> | LocationSet<null, "right">;
    }
    /* There is an icon and a caret, but only the location of the caret is specified.  The caret
       should be placed at the location dictated by the prop, and the icon should be placed on the
       opposite side.  The loading indicator should be shown over the icon, which is always the case
       (unless there is no icon). */
    return {
      icon: ui.getOppositeDirection(props.dropdownCaret),
      caret: props.dropdownCaret,
      loading: ui.getOppositeDirection(props.dropdownCaret),
    } as LocationSet<"left"> | LocationSet<"right">;
  } else if (props.iconLocation !== undefined && props.dropdownCaret === undefined) {
    /* There is no caret, the loading indicator should be shown over the icon and the icon should
       be placed in the location dictated by the prop. */
    return { icon: props.iconLocation, loading: props.iconLocation, caret: null } as
      | LocationSet<"right">
      | LocationSet<"left">;
  } else if (props.iconLocation !== undefined && props.dropdownCaret !== undefined) {
    if (props.icon === undefined) {
      logger.warn(
        "Unnecessary specification of the 'iconLocation' prop.  The 'iconLocation' prop is " +
          "only applicable if the 'icon' prop is defined.",
      );
      /* There is no icon, the loading indicator should be shown over the caret and the caret
         should be in the default location if the location is not provided or in the provided
         location if it is. */
      return {
        icon: null,
        loading: props.dropdownCaret === true ? ui.CSSDirections.RIGHT : props.dropdownCaret,
        caret: props.dropdownCaret === true ? ui.CSSDirections.RIGHT : props.dropdownCaret,
      } as LocationSet<null, "right"> | LocationSet<null, "left">;
    } else if (props.dropdownCaret === true) {
      /* There is an icon and a caret, but only the location of the icon is specified.  The icon
         should be placed at the location dictated by the prop, and the caret should be placed on
         the opposite side.  The loading indicator should be shown over the icon, which is always
         the case (unless there is no icon). */
      return {
        icon: props.iconLocation,
        loading: props.iconLocation,
        caret: ui.getOppositeDirection(props.iconLocation),
      } as LocationSet<"right"> | LocationSet<"left">;
    } else if (props.dropdownCaret === props.iconLocation) {
      logger.warn(
        `The location dictated by the 'dropdownCaret' prop, '${props.dropdownCaret}', ` +
          "conflicts with the location dictated by the 'iconLocation' prop, " +
          `'${props.iconLocation}'.  The 'iconLocation' prop will be favored, and the caret will ` +
          "be placed on the opposite side.",
      );
      return {
        icon: props.iconLocation,
        caret: ui.getOppositeDirection(props.iconLocation),
        loading: props.iconLocation,
      } as LocationSet<"left"> | LocationSet<"right">;
    }
    return {
      icon: props.iconLocation,
      caret: props.dropdownCaret,
      loading: props.iconLocation,
    } as LocationSet<"left"> | LocationSet<"right">;
  } else if (props.icon === undefined) {
    return { icon: null, caret: null, loading: ui.CSSDirections.LEFT };
  }
  return { icon: ui.CSSDirections.LEFT, caret: null, loading: ui.CSSDirections.LEFT };
};

const _ContentButtonSubContent = (props: ContentButtonSubContentProps): JSX.Element => {
  const loc = useMemo(
    () => getLocationSet({ iconLocation: props.iconLocation, dropdownCaret: props.dropdownCaret }),
    [props.dropdownCaret, props.iconLocation],
  );

  return (
    <>
      <ShowHide
        show={
          (props.loading === true && loc.loading === ui.CSSDirections.LEFT) ||
          (props.icon !== undefined && loc.icon === ui.CSSDirections.LEFT) ||
          (props.dropdownCaret !== undefined && loc.caret === ui.CSSDirections.LEFT)
        }
      >
        <Affix
          loading={props.loading}
          icon={
            props.icon !== undefined && loc.icon === ui.CSSDirections.LEFT ? (
              props.icon
            ) : props.dropdownCaret !== undefined && loc.caret === ui.CSSDirections.LEFT ? (
              <CaretIcon direction={props.dropdownCaretDirection} />
            ) : undefined
          }
        />
      </ShowHide>
      {/* In cases where the text characteristics are altered on user interaction events (such as
          making the text bold when the button or anchor is hovered), the width of the text in the
          button or anchor can change - which in turn will cause the width of the overall button or
          anchor to change.  We can avoid this in CSS by presetting the width of the text based on
          the largest width it would have for any interaction event.  To do that, we need an HTML
          reference to the text value, set as the `title` attribute on the element. */}
      <div
        className={classNames("button__sub-content", {
          "button__sub-content--string": typeof props.children === "string",
        })}
        title={typeof props.children === "string" ? props.children : undefined}
      >
        {props.children}
      </div>
      <ShowHide
        show={
          (props.loading === true && loc.loading === ui.CSSDirections.RIGHT) ||
          (props.icon !== undefined && loc.icon === ui.CSSDirections.RIGHT) ||
          (props.dropdownCaret !== undefined && loc.caret === ui.CSSDirections.RIGHT)
        }
      >
        <Affix
          loading={props.loading}
          icon={
            props.icon !== undefined && loc.icon === ui.CSSDirections.RIGHT ? (
              props.icon
            ) : props.dropdownCaret !== undefined && loc.caret === ui.CSSDirections.RIGHT ? (
              <CaretIcon direction={props.dropdownCaretDirection} />
            ) : undefined
          }
        />
      </ShowHide>
    </>
  );
};

const ContentButtonSubContent = React.memo(_ContentButtonSubContent);

type ContentProps<
  P extends ButtonProps<V> | AnchorProps<V>,
  V extends TextVariant = TextVariant,
> = P & ContentButtonSubContentProps;

// Provides the common props that are used for both the Button and the Anchor cases.
const useContentProps = <
  P extends ButtonProps<V> | AnchorProps<V>,
  V extends TextVariant = TextVariant,
>({
  iconLocation,
  ...props
}: Pick<ContentProps<P, V>, "className" | "children" | "loading" | "iconLocation" | "icon">) =>
  useMemo(
    () => ({
      className: classNames("button--content", props.className),
      children: (
        <ContentButtonSubContent
          loading={props.loading}
          icon={props.icon}
          iconLocation={iconLocation}
        >
          {props.children}
        </ContentButtonSubContent>
      ),
    }),
    [props.className, props.icon, props.children, props.loading, iconLocation],
  );

export type ContentButtonProps<V extends TextVariant = TextVariant> = ContentProps<
  ButtonProps<V>,
  V
>;

export const ContentButton = <V extends TextVariant = TextVariant>({
  icon,
  iconLocation,
  ...props
}: ContentProps<ButtonProps<V>, V>) => {
  const ps = useContentProps<ButtonProps<V>, V>({ icon, iconLocation, ...props });
  return <Button {...props} {...ps} />;
};

export type ContentAnchorProps<V extends TextVariant = TextVariant> = ContentProps<
  AnchorProps<V>,
  V
>;

export const ContentAnchor = <V extends TextVariant = TextVariant>({
  icon,
  iconLocation,
  ...props
}: ContentProps<AnchorProps<V>, V>) => {
  const ps = useContentProps<AnchorProps<V>, V>({ icon, iconLocation, ...props });
  return <Anchor {...props} {...ps} />;
};
