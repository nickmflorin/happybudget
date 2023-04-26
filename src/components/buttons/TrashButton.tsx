import classNames from "classnames";

import * as icons from "lib/ui/icons";

import { BareActionButton, BareActionButtonProps } from "./BareActionButton";

export const TrashButton = (props: Omit<BareActionButtonProps, "icon">): JSX.Element => (
  <BareActionButton
    {...props}
    className={classNames("button--trash", props.className)}
    icon={icons.IconNames.TRASH}
  />
);
