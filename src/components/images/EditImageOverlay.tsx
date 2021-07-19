import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/pro-solid-svg-icons";

import ImageOverlay, { ImageOverlayProps } from "./ImageOverlay";
import "./EditImageOverlay.scss";

const EditImageOverlay = (props: Omit<ImageOverlayProps, "children">): JSX.Element => {
  return (
    <ImageOverlay {...props}>
      <div className={"img-overlay--edit-image"}>
        <FontAwesomeIcon className={"icon"} icon={faPencilAlt} />
        <div className={"overlay-text"}>{"Edit"}</div>
      </div>
    </ImageOverlay>
  );
};

export default EditImageOverlay;
