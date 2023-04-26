import classNames from "classnames";

import * as icons from "lib/ui/icons";
import * as ui from "lib/ui/types";

import { Icon } from "./Icon";

type CaretIconProps = Omit<icons.IconComponentProps, "icon"> & {
  readonly direction?: Exclude<
    ui.CSSDirection,
    typeof ui.CSSDirections.LEFT | typeof ui.CSSDirections.RIGHT
  >;
};

export const CaretIcon = ({ direction = ui.CSSDirections.DOWN, ...props }: CaretIconProps) => (
  <Icon
    className={classNames("icon--caret", props.className)}
    {...props}
    icon={
      direction === ui.CSSDirections.DOWN ? icons.IconNames.CARET_DOWN : icons.IconNames.CARET_UP
    }
  />
);
