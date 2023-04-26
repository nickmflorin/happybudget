import * as buttons from "lib/ui/buttons/types";
import { useLessThanBreakpoint } from "lib/ui/hooks";
import * as icons from "lib/ui/icons";
import { removeObjAttributes } from "lib/util";
import { constants } from "style";

import { PrimaryActionButton } from "./PrimaryActionButton";
import { PrimaryButtonProps, PrimaryButton } from "./PrimaryButton";

type BaseProps = Omit<PrimaryButtonProps, "icon"> & {
  readonly breakpoint: constants.BreakpointId;
  readonly breakpointStyle?: buttons.Style;
};

type PrimaryButtonIconToggleBreakpointIconProps = BaseProps & {
  readonly breakpointIcon: icons.IconProp;
  readonly icon?: icons.IconProp;
};

type PrimaryButtonIconToggleSameIconProps = BaseProps & {
  readonly icon: icons.IconProp;
};

export type PrimaryButtonIconToggleProps =
  | PrimaryButtonIconToggleBreakpointIconProps
  | PrimaryButtonIconToggleSameIconProps;

const isPropsWithBreakpointIcon = (
  props: PrimaryButtonIconToggleProps,
): props is PrimaryButtonIconToggleBreakpointIconProps =>
  (props as PrimaryButtonIconToggleBreakpointIconProps).breakpointIcon !== undefined;

export const PrimaryButtonIconToggle = (props: PrimaryButtonIconToggleProps): JSX.Element => {
  const isLessThan = useLessThanBreakpoint(props.breakpoint);
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
