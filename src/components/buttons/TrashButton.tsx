import classNames from "classnames";

import { ui } from "lib";

import { BareActionButton, BareActionButtonProps } from "./BareActionButton";

export const TrashButton = (props: Omit<BareActionButtonProps, "icon">): JSX.Element => (
  <BareActionButton
    {...props}
    className={classNames("button--trash", props.className)}
    icon={ui.IconNames.TRASH_ALT}
  />
);
