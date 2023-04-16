import { ui } from "lib";

import { AlternateAnchor, AlternateAnchorProps } from "./abstract";

export type InlineAnchorProps = Omit<AlternateAnchorProps<typeof ui.ButtonAlternateVariants.INLINE>, "variant">

export const InlineAnchor = (props: InlineAnchorProps) => (
  <AlternateAnchor {...props} variant={ui.ButtonAlternateVariants.INLINE} />
);
