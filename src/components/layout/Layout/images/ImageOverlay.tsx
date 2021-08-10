import classNames from "classnames";

export interface ImageOverlayProps extends StandardComponentWithChildrenProps {
  readonly visible?: boolean;
}

const ImageOverlay = (props: ImageOverlayProps): JSX.Element => {
  if (props.visible === false) {
    return <></>;
  }
  return (
    <div className={classNames("img-overlay", props.className)} style={props.style}>
      {props.children}
    </div>
  );
};

export default ImageOverlay;
