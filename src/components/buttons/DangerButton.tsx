import { ui } from "lib";

import { SolidButton, SolidButtonProps, SolidAnchor, SolidAnchorProps } from "./abstract";

export type DangerButtonProps = Omit<
  SolidButtonProps<typeof ui.ButtonSolidVariants.DANGER>,
  "variant"
>;

export const DangerButton = (props: DangerButtonProps) => (
  <SolidButton {...props} variant={ui.ButtonSolidVariants.DANGER} />
);

export type DangerAnchorProps = Omit<
  SolidAnchorProps<typeof ui.ButtonSolidVariants.DANGER>,
  "variant"
>;

export const DangerAnchor = (props: DangerAnchorProps) => (
  <SolidAnchor {...props} variant={ui.ButtonSolidVariants.DANGER} />
);
