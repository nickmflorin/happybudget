import { Icon } from "components";
import ImageOverlay, { ImageOverlayProps } from "./ImageOverlay";
import "./EditImageOverlay.scss";

const EditImageOverlay = (props: Omit<ImageOverlayProps, "children">): JSX.Element => {
  return (
    <ImageOverlay {...props}>
      <div className={"img-overlay--edit-image"}>
        <Icon icon={"pencil"} weight={"solid"} />
        <div className={"overlay-text"}>{"Edit"}</div>
      </div>
    </ImageOverlay>
  );
};

export default EditImageOverlay;
