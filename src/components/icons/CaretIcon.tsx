import classNames from "classnames";

import { ui } from "lib";

import { Icon } from "./Icon";

type CaretIconProps = Omit<ui.IconComponentProps, "icon"> & {
  readonly direction?: Exclude<
    ui.CSSDirection,
    typeof ui.CSSDirections.LEFT | typeof ui.CSSDirections.RIGHT
  >;
};

export const CaretIcon = ({ direction = ui.CSSDirections.DOWN, ...props }: CaretIconProps) => (
  <Icon
    className={classNames("icon--caret", props.className)}
    {...props}
    icon={direction === ui.CSSDirections.DOWN ? ui.IconNames.CARET_DOWN : ui.IconNames.CARET_UP}
  />
);
