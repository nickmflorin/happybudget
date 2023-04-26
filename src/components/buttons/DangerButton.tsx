import * as buttons from "lib/ui/buttons/types";

import { SolidButton, SolidButtonProps, SolidAnchor, SolidAnchorProps } from "./abstract";

export type DangerButtonProps = Omit<
  SolidButtonProps<typeof buttons.ButtonSolidVariants.DANGER>,
  "variant"
>;

export const DangerButton = (props: DangerButtonProps) => (
  <SolidButton {...props} variant={buttons.ButtonSolidVariants.DANGER} />
);

export type DangerAnchorProps = Omit<
  SolidAnchorProps<typeof buttons.ButtonSolidVariants.DANGER>,
  "variant"
>;

export const DangerAnchor = (props: DangerAnchorProps) => (
  <SolidAnchor {...props} variant={buttons.ButtonSolidVariants.DANGER} />
);
