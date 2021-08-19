import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import * as typeguards from "lib/model/typeguards";

import { Icon, FullSize, ShowHide, VerticalFlexCenter } from "components";
import { ImageClearButton } from "components/buttons";
import { UserImageOrInitials, EditImageOverlay } from "components/layout/Layout/images";

import Uploader, { UploaderProps } from "./Uploader";
import "./UploadUserImage.scss";

export interface UploadUserImageProps extends UploaderProps {
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly imageClearButtonProps?: StandardComponentProps;
}

const UploadUserImageNoInitials = (): JSX.Element => {
  return (
    <div className={"no-initials"}>
      <VerticalFlexCenter className={"no-initials-icon-wrapper"}>
        <Icon icon={"camera"} weight={"solid"} />
      </VerticalFlexCenter>
      <VerticalFlexCenter className={"no-initials-icon-wrapper"}>
        <Icon icon={"plus"} weight={"solid"} />
      </VerticalFlexCenter>
    </div>
  );
};

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
              renderNoInitials={<UploadUserImageNoInitials />}
            />
          </FullSize>
        );
      }}
    />
  );
};

export default UploadUserImage;
