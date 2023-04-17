import React from "react";

import { ui, removeObjAttributes } from "lib";

import { PrimaryActionButton } from "./PrimaryActionButton";
import { PrimaryButtonProps, PrimaryButton } from "./PrimaryButton";

type BaseProps = Omit<PrimaryButtonProps, "icon"> & {
  readonly breakpoint: ui.BreakpointId;
  readonly breakpointStyle?: ui.Style;
};

type PrimaryButtonIconToggleBreakpointIconProps = BaseProps & {
  readonly breakpointIcon: ui.IconProp;
  readonly icon?: ui.IconProp;
};

type PrimaryButtonIconToggleSameIconProps = BaseProps & {
  readonly icon: ui.IconProp;
};

export type PrimaryButtonIconToggleProps =
  | PrimaryButtonIconToggleBreakpointIconProps
  | PrimaryButtonIconToggleSameIconProps;

const isPropsWithBreakpointIcon = (
  props: PrimaryButtonIconToggleProps,
): props is PrimaryButtonIconToggleBreakpointIconProps =>
  (props as PrimaryButtonIconToggleBreakpointIconProps).breakpointIcon !== undefined;

export const PrimaryButtonIconToggle = (props: PrimaryButtonIconToggleProps): JSX.Element => {
  const isLessThan = ui.useLessThanBreakpoint(props.breakpoint);
  if (isLessThan) {
    return (
      <PrimaryActionButton
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
    <PrimaryButton
      {...removeObjAttributes(props, [
        "breakpointIcon",
        "breakpoint",
        "breakpointStyle",
        "children",
      ])}
    >
      {props.children}
    </PrimaryButton>
  );
};
