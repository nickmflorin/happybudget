import { isNil } from "lodash";

import { Icon } from "components";
import { ImageClearButton } from "components/buttons";

import ImageOverlay, { ImageOverlayProps } from "./ImageOverlay";
import "./EditImageOverlay.scss";

interface EditImageOverlayProps extends Omit<ImageOverlayProps, "children"> {
  readonly onClear?: () => void;
}

const EditImageOverlay = ({ onClear, ...props }: EditImageOverlayProps): JSX.Element => {
  return (
    <ImageOverlay {...props}>
      <div className={"img-overlay--edit-image"}>
        <Icon icon={"pencil"} weight={"solid"} />
        <div className={"overlay-text"}>{"Edit"}</div>
      </div>
      {!isNil(onClear) && (
        <ImageClearButton
          onClick={(e: React.MouseEvent<any>) => {
            e.stopPropagation();
            e.preventDefault();
            onClear();
          }}
        />
      )}
    </ImageOverlay>
  );
};

export default EditImageOverlay;
