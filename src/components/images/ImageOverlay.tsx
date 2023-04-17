import classNames from "classnames";

import { ui } from "lib";

export type ImageOverlayProps = ui.ComponentProps<{
  readonly visible?: boolean;
}>;

export const ImageOverlay = (props: ImageOverlayProps): JSX.Element => {
  if (props.visible === false) {
    return <></>;
  }
  return (
    <div {...props} className={classNames("img-overlay", props.className)} style={props.style} />
  );
};
