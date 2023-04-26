import * as buttons from "lib/ui/buttons/types";

import { AlternateButton, AlternateButtonProps } from "./abstract";

export type DangerAlternateButtonProps = Omit<
  AlternateButtonProps<typeof buttons.ButtonAlternateVariants.DANGER>,
  "variant"
>;

export const DangerAlternateButton = (props: DangerAlternateButtonProps) => (
  <AlternateButton {...props} variant={buttons.ButtonAlternateVariants.DANGER} />
);
