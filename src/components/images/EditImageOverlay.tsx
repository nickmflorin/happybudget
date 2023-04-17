import React from "react";

import { ImageClearButton } from "components/buttons";
import { Icon } from "components/icons";

import { ImageOverlay, ImageOverlayProps } from "./ImageOverlay";

type EditImageOverlayProps = Omit<ImageOverlayProps, "children"> & {
  readonly onClear?: () => void;
  readonly isImage?: boolean;
};

const EditImageOverlay = ({ onClear, isImage, ...props }: EditImageOverlayProps): JSX.Element => (
  <ImageOverlay {...props}>
    <div className="img-overlay--edit-image">
      {!isNil(isImage) ? (
        <React.Fragment>
          <div className="icon-wrapper--edit">
            <Icon icon="edit" weight="solid" className="edit" />
          </div>
          {!isNil(onClear) && (
            <ImageClearButton
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                onClear();
              }}
            />
          )}
        </React.Fragment>
      ) : (
        <div className="icon-wrapper--plus">
          <Icon icon="plus" weight="solid" className="plus" />
        </div>
      )}
    </div>
  </ImageOverlay>
);

export default React.memo(EditImageOverlay);
