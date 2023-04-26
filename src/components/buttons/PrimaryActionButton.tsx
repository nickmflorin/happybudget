import * as buttons from "lib/ui/buttons/types";

import { ActionButton, ActionButtonProps, ActionAnchor, ActionAnchorProps } from "./abstract";

type PrimaryActionProps<
  P extends
    | ActionAnchorProps<typeof buttons.ButtonActionVariants.PRIMARY>
    | ActionButtonProps<typeof buttons.ButtonActionVariants.PRIMARY> =
    | ActionAnchorProps<typeof buttons.ButtonActionVariants.PRIMARY>
    | ActionButtonProps<typeof buttons.ButtonActionVariants.PRIMARY>,
> = Omit<P, "variant">;

export type PrimaryActionButtonProps = PrimaryActionProps<
  ActionButtonProps<typeof buttons.ButtonActionVariants.PRIMARY>
>;

export const PrimaryActionButton = (props: PrimaryActionButtonProps) => (
  <ActionButton {...props} variant={buttons.ButtonActionVariants.PRIMARY} />
);

export type PrimaryActionAnchorProps = PrimaryActionProps<
  ActionAnchorProps<typeof buttons.ButtonActionVariants.PRIMARY>
>;

export const PrimaryActionAnchor = (props: PrimaryActionAnchorProps) => (
  <ActionAnchor {...props} variant={buttons.ButtonActionVariants.PRIMARY} />
);
