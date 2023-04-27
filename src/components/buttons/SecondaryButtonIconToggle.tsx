import { icons } from "lib/ui";
import * as buttons from "lib/ui/buttons/types";
import { useLessThanBreakpoint } from "lib/ui/hooks";
import { removeObjAttributes } from "lib/util";
import { constants } from "style";

import { SecondaryActionButton } from "./SecondaryActionButton";
import { SecondaryButtonProps, SecondaryButton } from "./SecondaryButton";

type BaseProps = Omit<SecondaryButtonProps, "icon"> & {
  readonly breakpoint: constants.BreakpointId;
  readonly breakpointStyle?: buttons.Style;
};

type SecondaryButtonIconToggleBreakpointIconProps = BaseProps & {
  readonly breakpointIcon: icons.IconProp;
  readonly icon?: icons.IconProp;
};

type SecondaryButtonIconToggleSameIconProps = BaseProps & {
  readonly icon: icons.IconProp;
};

export type SecondaryButtonIconToggleProps =
  | SecondaryButtonIconToggleBreakpointIconProps
  | SecondaryButtonIconToggleSameIconProps;

const isPropsWithBreakpointIcon = (
  props: SecondaryButtonIconToggleProps,
): props is SecondaryButtonIconToggleBreakpointIconProps =>
  (props as SecondaryButtonIconToggleBreakpointIconProps).breakpointIcon !== undefined;

export const SecondaryButtonIconToggle = (props: SecondaryButtonIconToggleProps): JSX.Element => {
  const isLessThan = useLessThanBreakpoint(props.breakpoint);
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
