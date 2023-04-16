import { ui } from "lib";

import { ActionButton, ActionButtonProps, ActionAnchor, ActionAnchorProps } from "./abstract";

type SecondaryActionProps<
  P extends
    | ActionAnchorProps<typeof ui.ButtonActionVariants.SECONDARY>
    | ActionButtonProps<typeof ui.ButtonActionVariants.SECONDARY> =
    | ActionAnchorProps<typeof ui.ButtonActionVariants.SECONDARY>
    | ActionButtonProps<typeof ui.ButtonActionVariants.SECONDARY>,
> = Omit<P, "variant">;

export type SecondaryActionButtonProps = SecondaryActionProps<
  ActionButtonProps<typeof ui.ButtonActionVariants.SECONDARY>
>;

export const SecondaryActionButton = (props: SecondaryActionButtonProps) => (
  <ActionButton {...props} variant={ui.ButtonActionVariants.SECONDARY} />
);

export type SecondaryActionAnchorProps = SecondaryActionProps<
  ActionAnchorProps<typeof ui.ButtonActionVariants.SECONDARY>
>;

export const SecondaryActionAnchor = (props: SecondaryActionAnchorProps) => (
  <ActionAnchor {...props} variant={ui.ButtonActionVariants.SECONDARY} />
);
