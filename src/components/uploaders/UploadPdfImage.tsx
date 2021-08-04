import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages, faExclamationCircle, faCheckCircle } from "@fortawesome/pro-solid-svg-icons";

import { ClearButton } from "components/buttons";
import * as typeguards from "lib/model/typeguards";
import { truncateFileName } from "lib/util/files";

import Uploader, { UploaderProps } from "./Uploader";
import "./UploadPdfImage.scss";

const UploadPdfImage = (props: UploaderProps): JSX.Element => {
  // NOTE: We could show a loading indicator when the upload is loading, but it
  // usually happens too fast and looks weird because the indicator just flashes
  // on screen.
  return (
    <Uploader
      {...props}
      className={classNames("pdf-image-uploader", props.className)}
      showLoadingIndicator={false}
      renderContent={(params: UploadImageParams) => {
        if (!isNil(params.error)) {
          return (
            <React.Fragment>
              <FontAwesomeIcon className={"icon"} icon={faExclamationCircle} />
              <div className={"upload-text error-text"}>
                {typeof params.error === "string" ? params.error : params.error.message}
              </div>
            </React.Fragment>
          );
        } else if (typeguards.isUploadParamsWithImage(params)) {
          return (
            <React.Fragment>
              <FontAwesomeIcon className={"icon"} icon={faCheckCircle} />
              <div className={"upload-text file-text"}>
                {typeguards.isUploadedImage(params.image)
                  ? truncateFileName(params.image.fileName || params.image.name, 18)
                  : `Saved ${params.image.extension} Image`}
              </div>
              <ClearButton
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
            <FontAwesomeIcon className={"icon"} icon={faImages} />
            <div className={"upload-text no-file-text"}>{"Upload File"}</div>
          </React.Fragment>
        );
      }}
    />
  );
};

export default UploadPdfImage;
