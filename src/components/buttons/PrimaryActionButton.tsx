import { ui } from "lib";

import { ActionButton, ActionButtonProps, ActionAnchor, ActionAnchorProps } from "./abstract";

type PrimaryActionProps<
  P extends
    | ActionAnchorProps<typeof ui.ButtonActionVariants.PRIMARY>
    | ActionButtonProps<typeof ui.ButtonActionVariants.PRIMARY> =
    | ActionAnchorProps<typeof ui.ButtonActionVariants.PRIMARY>
    | ActionButtonProps<typeof ui.ButtonActionVariants.PRIMARY>,
> = Omit<P, "variant">;

export type PrimaryActionButtonProps = PrimaryActionProps<
  ActionButtonProps<typeof ui.ButtonActionVariants.PRIMARY>
>;

export const PrimaryActionButton = (props: PrimaryActionButtonProps) => (
  <ActionButton {...props} variant={ui.ButtonActionVariants.PRIMARY} />
);

export type PrimaryActionAnchorProps = PrimaryActionProps<
  ActionAnchorProps<typeof ui.ButtonActionVariants.PRIMARY>
>;

export const PrimaryActionAnchor = (props: PrimaryActionAnchorProps) => (
  <ActionAnchor {...props} variant={ui.ButtonActionVariants.PRIMARY} />
);
