import { ui } from "lib";

import { SolidAnchor, SolidAnchorProps, SolidButton, SolidButtonProps } from "./abstract";

export type PrimaryButtonProps = Omit<
  SolidButtonProps<typeof ui.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const PrimaryButton = (props: PrimaryButtonProps) => (
  <SolidButton {...props} variant={ui.ButtonSolidVariants.PRIMARY} />
);

export type PrimaryAnchorProps = Omit<
  SolidAnchorProps<typeof ui.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const PrimaryAnchor = (props: PrimaryAnchorProps) => (
  <SolidAnchor {...props} variant={ui.ButtonSolidVariants.PRIMARY} />
);
