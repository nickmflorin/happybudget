import classNames from "classnames";

import { icons } from "lib/ui";

import { BareActionButton, BareActionButtonProps } from "./BareActionButton";

export const NewRowButton = (props: Omit<BareActionButtonProps, "icon" | "color">): JSX.Element => (
  <BareActionButton
    {...props}
    color={icons.IconColors.BRAND}
    className={classNames("btn--new-row", props.className)}
    icon={icons.IconNames.CIRCLE_PLUS}
  />
);
