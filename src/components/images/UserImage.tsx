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
    if (isNil(src) && !isNil(user)) {
      return model.contact.isContact(user) ? user.image?.url || null : user.profile_image.url;
    }
    return src || null;
  }, [user, src]);
  return !isNil(imageSrc) ? (
    <Image
      {...props}
      className={classNames("img--user", props.className)}
      src={imageSrc}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error(`Error loading user image at src ${imageSrc}!`);
        props.onError?.(e);
      }}
    />
  ) : (
    <></>
  );
};

export default React.memo(UserImage);
