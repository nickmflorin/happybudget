import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { model } from "lib";
import Image, { ImageProps } from "./Image";

export interface UserImageProps extends Omit<ImageProps, "src"> {
  readonly user?: Model.UserWithImage;
  readonly src?: string;
  readonly circle?: boolean;
}

const UserImage = ({ user, src, ...props }: UserImageProps): JSX.Element => {
  const imageSrc = useMemo<string | null>(() => {
    if (isNil(src)) {
      if (!isNil(user) && model.typeguards.isContact(user)) {
        return !isNil(user.image) ? user.image.url : null;
      } else if (!isNil(user)) {
        return !isNil(user.profile_image) ? user.profile_image.url : null;
      }
      return null;
    }
    return src;
  }, [user, src]);
  return !isNil(imageSrc) ? (
    <Image
      {...props}
      className={classNames("img--user", props.className)}
      src={imageSrc}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error(`Error loading user image at src ${imageSrc}!`);
        !isNil(props.onError) && props.onError(e);
      }}
    />
  ) : (
    <></>
  );
};

export default React.memo(UserImage);
