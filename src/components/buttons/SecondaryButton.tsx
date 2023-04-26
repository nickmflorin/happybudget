import * as buttons from "lib/ui/buttons/types";

import { SolidAnchor, SolidAnchorProps, SolidButton, SolidButtonProps } from "./abstract";

export type SecondaryButtonProps = Omit<
  SolidButtonProps<typeof buttons.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const SecondaryButton = (props: SecondaryButtonProps) => (
  <SolidButton {...props} variant={buttons.ButtonSolidVariants.PRIMARY} />
);

export type SecondaryAnchorProps = Omit<
  SolidAnchorProps<typeof buttons.ButtonSolidVariants.PRIMARY>,
  "variant"
>;

export const SecondaryAnchor = (props: SecondaryAnchorProps) => (
  <SolidAnchor {...props} variant={buttons.ButtonSolidVariants.PRIMARY} />
);
