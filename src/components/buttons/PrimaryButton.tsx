import * as buttons from "lib/ui/buttons/types";

import { SolidAnchor, SolidAnchorProps, SolidButton, SolidButtonProps } from "./abstract";

export type PrimaryButtonProps = Omit<
  SolidButtonProps<typeof buttons.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const PrimaryButton = (props: PrimaryButtonProps) => (
  <SolidButton {...props} variant={buttons.ButtonSolidVariants.PRIMARY} />
);

export type PrimaryAnchorProps = Omit<
  SolidAnchorProps<typeof buttons.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const PrimaryAnchor = (props: PrimaryAnchorProps) => (
  <SolidAnchor {...props} variant={buttons.ButtonSolidVariants.PRIMARY} />
);
