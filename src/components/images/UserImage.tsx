import React, { useMemo } from "react";

import classNames from "classnames";

import { logger } from "internal";
import { model } from "lib";

import { Image, ImageProps } from "./Image";

export type UserImageProps = Omit<ImageProps, "src"> & {
  readonly user?: model.UserWithImage;
  readonly src?: string | null;
  readonly circle?: boolean;
};

export const UserImage = ({ user, src, ...props }: UserImageProps): JSX.Element => {
  const imageSrc = useMemo<string | null>(() => {
    if (src === undefined && user !== undefined) {
      return model.isContact(user) ? user.image?.url || null : user.profile_image.url;
    }
    return src || null;
  }, [user, src]);
  return imageSrc !== null ? (
    <Image
      {...props}
      className={classNames("img--user", props.className)}
      src={imageSrc}
      alt={user !== undefined ? `Image for user ${model.fullName(user)}` : "User Image"}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        let logContext: Record<string, string | number> = { imageSrc };
        if (user !== undefined) {
          logContext = {
            ...logContext,
            modelType: model.isContact(user) ? user.type : "user",
            modelId: user.id,
          };
        }
        logger.error(logContext, `Error loading user image at src ${imageSrc}!`);
        props.onError?.(e);
      }}
    />
  ) : (
    <></>
  );
};
