import { ui } from "lib";

import { SolidButton, SolidButtonProps, SolidAnchor, SolidAnchorProps } from "./abstract";

type BareProps<
  P extends
    | SolidButtonProps<typeof ui.ButtonSolidVariants.BARE>
    | SolidAnchorProps<typeof ui.ButtonSolidVariants.BARE> =
    | SolidButtonProps<typeof ui.ButtonSolidVariants.BARE>
    | SolidAnchorProps<typeof ui.ButtonSolidVariants.BARE>,
> = Omit<P, "variant">;

export type BareButtonProps = BareProps<SolidButtonProps<typeof ui.ButtonSolidVariants.BARE>>;

export const BareButton = (props: BareButtonProps) => (
  <SolidButton {...props} variant={ui.ButtonSolidVariants.BARE} />
);

export type BareAnchorProps = BareProps<SolidAnchorProps<typeof ui.ButtonSolidVariants.BARE>>;

export const BareAnchor = (props: BareAnchorProps) => (
  <SolidAnchor {...props} variant={ui.ButtonSolidVariants.BARE} />
);
