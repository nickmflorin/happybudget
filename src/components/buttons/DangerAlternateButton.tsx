import { ui } from "lib";

import { AlternateButton, AlternateButtonProps } from "./abstract";

export type DangerAlternateButtonProps = Omit<
  AlternateButtonProps<typeof ui.ButtonAlternateVariants.DANGER>,
  "variant"
>;

export const DangerAlternateButton = (props: DangerAlternateButtonProps) => (
  <AlternateButton {...props} variant={ui.ButtonAlternateVariants.DANGER} />
);
