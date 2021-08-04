import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import * as typeguards from "lib/model/typeguards";

import { FullSize, ShowHide } from "components";
import { ImageClearButton } from "components/buttons";
import { UserImageOrInitials, EditImageOverlay } from "components/images";

import Uploader, { UploaderProps } from "./Uploader";
import "./UploadUserImage.scss";

export interface UploadUserImageProps extends UploaderProps {
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly imageClearButtonProps?: StandardComponentProps;
}

const UploadUserImage = ({
  firstName,
  lastName,
  imageClearButtonProps,
  ...props
}: UploadUserImageProps): JSX.Element => {
  return (
    <Uploader
      {...props}
      className={classNames("user-image-uploader", props.className)}
      renderContentNoError={(params: UploadImageParams) => {
        return (
          <FullSize>
            <ShowHide show={typeguards.isUploadParamsWithImage(params)}>
              <ImageClearButton
                {...imageClearButtonProps}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  ...(!isNil(imageClearButtonProps) ? imageClearButtonProps.style : {})
                }}
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
