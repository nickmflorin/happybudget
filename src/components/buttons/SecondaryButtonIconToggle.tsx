import React from "react";

import { ui, removeObjAttributes } from "lib";

import { SecondaryActionButton } from "./SecondaryActionButton";
import { SecondaryButtonProps, SecondaryButton } from "./SecondaryButton";

type BaseProps = Omit<SecondaryButtonProps, "icon"> & {
  readonly breakpoint: ui.BreakpointId;
  readonly breakpointStyle?: ui.Style;
};

type SecondaryButtonIconToggleBreakpointIconProps = BaseProps & {
  readonly breakpointIcon: ui.IconProp;
  readonly icon?: ui.IconProp;
};

type SecondaryButtonIconToggleSameIconProps = BaseProps & {
  readonly icon: ui.IconProp;
};

export type SecondaryButtonIconToggleProps =
  | SecondaryButtonIconToggleBreakpointIconProps
  | SecondaryButtonIconToggleSameIconProps;

const isPropsWithBreakpointIcon = (
  props: SecondaryButtonIconToggleProps,
): props is SecondaryButtonIconToggleBreakpointIconProps =>
  (props as SecondaryButtonIconToggleBreakpointIconProps).breakpointIcon !== undefined;

export const SecondaryButtonIconToggle = (props: SecondaryButtonIconToggleProps): JSX.Element => {
  const isLessThan = ui.useLessThanBreakpoint(props.breakpoint);
  if (isLessThan) {
    return (
      <SecondaryActionButton
        {...removeObjAttributes(props, [
          "breakpointIcon",
          "breakpoint",
          "breakpointStyle",
          "children",
        ])}
        icon={isPropsWithBreakpointIcon(props) ? props.breakpointIcon : props.icon}
        style={props.breakpointStyle || props.style}
      />
    );
  }
  return (
    <SecondaryButton
      {...removeObjAttributes(props, [
        "breakpointIcon",
        "breakpoint",
        "breakpointStyle",
        "children",
      ])}
    >
      {props.children}
    </SecondaryButton>
  );
};
