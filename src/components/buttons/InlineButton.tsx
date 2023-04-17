import classNames from "classnames";

import { ui } from "lib";

import { AlternateButton, AlternateButtonProps } from "./abstract";

export type InlineButtonProps = Omit<
  AlternateButtonProps<typeof ui.ButtonAlternateVariants.LINK>,
  "variant"
>;

export const InlineButton = (props: InlineButtonProps) => (
  <AlternateButton
    {...props}
    className={classNames("button--inline", props.className)}
    variant={ui.ButtonAlternateVariants.LINK}
  />
);
