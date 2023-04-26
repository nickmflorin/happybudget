import classNames from "classnames";

import * as icons from "lib/ui/icons";

import { BareButton, BareButtonProps } from "./BareButton";

export type HelpAnchorProps = Omit<
  BareButtonProps,
  "children" | "icon" | "dropdownCaret" | "dropdownCaretDirection"
>;

export const HelpAnchor = (props: HelpAnchorProps): JSX.Element => (
  <BareButton
    {...props}
    className={classNames("button--help", props.className)}
    icon={icons.IconNames.CIRCLE_QUESTION}
  >
    Help
  </BareButton>
);
