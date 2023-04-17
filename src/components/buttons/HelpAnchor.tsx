import classNames from "classnames";

import { ui } from "lib";

import { BareButton, BareButtonProps } from "./BareButton";

export type HelpAnchorProps = Omit<
  BareButtonProps,
  "children" | "icon" | "dropdownCaret" | "dropdownCaretDirection"
>;

export const HelpAnchor = (props: HelpAnchorProps): JSX.Element => (
  <BareButton
    {...props}
    className={classNames("button--help", props.className)}
    icon={ui.IconNames.CIRCLE_QUESTION}
  >
    Help
  </BareButton>
);
