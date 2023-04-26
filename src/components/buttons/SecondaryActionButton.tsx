import * as buttons from "lib/ui/buttons/types";

import { ActionButton, ActionButtonProps, ActionAnchor, ActionAnchorProps } from "./abstract";

type SecondaryActionProps<
  P extends
    | ActionAnchorProps<typeof buttons.ButtonActionVariants.SECONDARY>
    | ActionButtonProps<typeof buttons.ButtonActionVariants.SECONDARY> =
    | ActionAnchorProps<typeof buttons.ButtonActionVariants.SECONDARY>
    | ActionButtonProps<typeof buttons.ButtonActionVariants.SECONDARY>,
> = Omit<P, "variant">;

export type SecondaryActionButtonProps = SecondaryActionProps<
  ActionButtonProps<typeof buttons.ButtonActionVariants.SECONDARY>
>;

export const SecondaryActionButton = (props: SecondaryActionButtonProps) => (
  <ActionButton {...props} variant={buttons.ButtonActionVariants.SECONDARY} />
);

export type SecondaryActionAnchorProps = SecondaryActionProps<
  ActionAnchorProps<typeof buttons.ButtonActionVariants.SECONDARY>
>;

export const SecondaryActionAnchor = (props: SecondaryActionAnchorProps) => (
  <ActionAnchor {...props} variant={buttons.ButtonActionVariants.SECONDARY} />
);
