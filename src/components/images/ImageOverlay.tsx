import classNames from "classnames";

import { ui } from "lib";
import { ShowHide } from "components/util";

export type ImageOverlayProps = ui.ComponentProps<{
  readonly visible?: boolean;
}>;

export const ImageOverlay = (props: ImageOverlayProps): JSX.Element => (
  <ShowHide hide={props.visible === false}>
    <div {...props} className={classNames("img-overlay", props.className)} style={props.style} />
  </ShowHide>
);
