import * as buttons from "lib/ui/buttons/types";

import { SolidButton, SolidButtonProps, SolidAnchor, SolidAnchorProps } from "./abstract";

type BareProps<
  P extends
    | SolidButtonProps<typeof buttons.ButtonSolidVariants.BARE>
    | SolidAnchorProps<typeof buttons.ButtonSolidVariants.BARE> =
    | SolidButtonProps<typeof buttons.ButtonSolidVariants.BARE>
    | SolidAnchorProps<typeof buttons.ButtonSolidVariants.BARE>,
> = Omit<P, "variant">;

export type BareButtonProps = BareProps<SolidButtonProps<typeof buttons.ButtonSolidVariants.BARE>>;

export const BareButton = (props: BareButtonProps) => (
  <SolidButton {...props} variant={buttons.ButtonSolidVariants.BARE} />
);

export type BareAnchorProps = BareProps<SolidAnchorProps<typeof buttons.ButtonSolidVariants.BARE>>;

export const BareAnchor = (props: BareAnchorProps) => (
  <SolidAnchor {...props} variant={buttons.ButtonSolidVariants.BARE} />
);
