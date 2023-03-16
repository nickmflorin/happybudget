import React from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { model, util } from "lib";
import { Icon } from "components";
import { ClearButton } from "components/buttons";

import Uploader, { UploaderProps } from "./Uploader";

/* NOTE: We could show a loading indicator when the upload is loading, but it
  usually happens too fast and looks weird because the indicator just flashes
  on screen. */
const PdfImageUploader = (props: UploaderProps): JSX.Element => (
  <Uploader
    {...props}
    className={classNames("pdf-image-uploader", props.className)}
    showLoadingIndicator={false}
    renderContent={(params: UploadImageParams) => {
      if (!isNil(params.error)) {
        return (
          <React.Fragment>
            <Icon icon="exclamation-circle" weight="solid" style={{ marginLeft: 6 }} />
            <div className="upload-text error-text">
              {typeof params.error === "string" ? params.error : params.error.message}
            </div>
          </React.Fragment>
        );
      } else if (model.isUploadParamsWithImage(params)) {
        return (
          <React.Fragment>
            <Icon icon="check-circle" weight="solid" style={{ marginLeft: 6 }} />
            <div className="upload-text file-text">
              {model.isUploadedImage(params.image)
                ? util.files.truncateFileName(params.image.fileName || params.image.name, 18)
                : !isNil(params.image.extension)
                ? `Saved ${params.image.extension} Image`
                : "Saved Image"}
            </div>
            <ClearButton
              size="small"
              iconSize="small"
              onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                e.preventDefault();
                e.stopPropagation();
                params.onClear();
              }}
            />
          </React.Fragment>
        );
      }
      return (
        <React.Fragment>
          <Icon icon="images" weight="solid" style={{ marginLeft: 6 }} />
          <div className="upload-text no-file-text">Upload File</div>
        </React.Fragment>
      );
    }}
  />
);

export default React.memo(PdfImageUploader);
