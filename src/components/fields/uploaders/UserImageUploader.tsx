import React from "react";
import classNames from "classnames";

import { typeguards } from "lib";

import { Icon, FullSize, VerticalFlexCenter } from "components";
import { UserImageOrInitials, EditImageOverlay } from "components/images";

import Uploader, { UploaderProps } from "./Uploader";

export type UploadUserImageProps = UploaderProps & {
  readonly firstName: string | null;
  readonly lastName: string | null;
};

const UploadUserImageNoInitials = React.memo((): JSX.Element => {
  return (
    <div className={"no-initials"}>
      <VerticalFlexCenter className={"no-initials-icon-wrapper"}>
        <Icon icon={"camera"} weight={"solid"} />
      </VerticalFlexCenter>
    </div>
  );
});

const UploadUserImage = ({ firstName, lastName, ...props }: UploadUserImageProps): JSX.Element => (
  <Uploader
    {...props}
    className={classNames("user-image-uploader", props.className)}
    renderContentNoError={(params: UploadImageParams) => {
      return (
        <FullSize>
          <UserImageOrInitials
            circle={true}
            src={typeguards.isUploadParamsWithImage(params) ? params.image.url : null}
            firstName={firstName}
            lastName={lastName}
            imageOverlay={() => <EditImageOverlay visible={true} onClear={params.onClear} isImage={true} />}
            initialsOverlay={() => <EditImageOverlay visible={true} />}
            renderNoInitials={<UploadUserImageNoInitials />}
          />
        </FullSize>
      );
    }}
  />
);

export default React.memo(UploadUserImage);
