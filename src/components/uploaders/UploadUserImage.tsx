import React from "react";
import classNames from "classnames";

import * as typeguards from "lib/model/typeguards";

import { FullSize, ShowHide } from "components";
import { ImageClearButton } from "components/buttons";
import { UserImageOrInitials, EditImageOverlay } from "components/images";

import Uploader, { UploaderProps } from "./Uploader";
import "./UploadUserImage.scss";

interface UploadUserImageProps extends UploaderProps {
  readonly firstName: string | null;
  readonly lastName: string | null;
}

const UploadUserImage = ({ firstName, lastName, ...props }: UploadUserImageProps): JSX.Element => {
  return (
    <Uploader
      {...props}
      className={classNames("user-image-uploader", props.className)}
      renderContentNoError={(params: UploadImageParams) => {
        return (
          <FullSize>
            <ShowHide show={typeguards.isUploadParamsWithImage(params)}>
              <ImageClearButton
                style={{ position: "absolute", top: 0, right: 0 }}
                onClick={(e: React.MouseEvent<any>) => {
                  e.stopPropagation();
                  e.preventDefault();
                  params.onClear();
                }}
              />
            </ShowHide>
            <UserImageOrInitials
              circle={true}
              src={typeguards.isUploadParamsWithImage(params) ? params.image.url : null}
              firstName={firstName}
              lastName={lastName}
              overlay={() => <EditImageOverlay visible={true} />}
            />
          </FullSize>
        );
      }}
    />
  );
};

export default UploadUserImage;
