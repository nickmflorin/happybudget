import classNames from "classnames";

import { icons } from "lib/ui";

import { BareActionButton, BareActionButtonProps } from "./BareActionButton";

export const ClearButton = (props: Omit<BareActionButtonProps, "icon">): JSX.Element => (
  <BareActionButton
    {...props}
    className={classNames("button--clear", props.className)}
    icon={icons.IconNames.CIRCLE_XMARK}
  />
);
