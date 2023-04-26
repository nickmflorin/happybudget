import classNames from "classnames";

import * as icons from "lib/ui/icons";

import { BareActionButton, BareActionButtonProps } from "./BareActionButton";

export const ImageClearButton = (props: Omit<BareActionButtonProps, "icon">): JSX.Element => (
  <BareActionButton
    {...props}
    className={classNames("button--image-clear", props.className)}
    icon={icons.IconNames.TIMES_CIRCLE}
  />
);
