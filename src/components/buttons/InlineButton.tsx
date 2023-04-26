import classNames from "classnames";

import * as buttons from "lib/ui/buttons/types";

import { AlternateButton, AlternateButtonProps } from "./abstract";

export type InlineButtonProps = Omit<
  AlternateButtonProps<typeof buttons.ButtonAlternateVariants.LINK>,
  "variant"
>;

export const InlineButton = (props: InlineButtonProps) => (
  <AlternateButton
    {...props}
    className={classNames("button--inline", props.className)}
    variant={buttons.ButtonAlternateVariants.LINK}
  />
);
