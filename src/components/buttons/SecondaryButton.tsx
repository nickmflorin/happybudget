import { ui } from "lib";

import { SolidAnchor, SolidAnchorProps, SolidButton, SolidButtonProps } from "./abstract";

export type SecondaryButtonProps = Omit<
  SolidButtonProps<typeof ui.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const SecondaryButton = (props: SecondaryButtonProps) => (
  <SolidButton {...props} variant={ui.ButtonSolidVariants.PRIMARY} />
);

export type SecondaryAnchorProps = Omit<
  SolidAnchorProps<typeof ui.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const SecondaryAnchor = (props: SecondaryAnchorProps) => (
  <SolidAnchor {...props} variant={ui.ButtonSolidVariants.PRIMARY} />
);
