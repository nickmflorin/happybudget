import classNames from "classnames";

import { ui } from "lib";

import { BareActionButton, BareActionButtonProps } from "./BareActionButton";

export const NewRowButton = (props: Omit<BareActionButtonProps, "icon" | "color">): JSX.Element => (
  <BareActionButton
    {...props}
    color={ui.IconColors.BRAND}
    className={classNames("btn--new-row", props.className)}
    icon={ui.IconNames.PLUS_CIRCLE}
  />
);
