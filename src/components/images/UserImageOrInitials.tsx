import React, { useEffect, useState, useMemo } from "react";
import { isNil } from "lodash";

import { model } from "lib";
import UserImage, { UserImageProps } from "./UserImage";
import UserInitials, { UserInitialsProps } from "./UserInitials";

export interface UserImageOrInitialsProps
  extends StandardComponentProps,
    Omit<UserInitialsProps, StandardComponentPropNames> {
  readonly user?: Model.User | Model.SimpleUser | Model.Contact;
  readonly src?: string | null;
  readonly initialsStyle?: React.CSSProperties;
  readonly initialsClassName?: string;
  readonly imageProps?: Omit<UserImageProps, "user" | "src">;
  readonly circle?: boolean;
  readonly imageOverlay?: () => JSX.Element;
  readonly initialsOverlay?: () => JSX.Element;
}

const UserImageOrInitials = ({
  user,
  src,
  imageProps,
  imageOverlay,
  initialsOverlay,
  initialsStyle,
  initialsClassName,
  ...props
}: UserImageOrInitialsProps): JSX.Element => {
  /* If there is an error loading the image, we want to fallback to the initials
     but still log that the error occurred. */
  const [errorWithImage, setErrorWithImage] = useState<React.SyntheticEvent<HTMLImageElement> | null>(null);

  useEffect(() => {
    setErrorWithImage(null);
  }, [src]);

  const userImageSrcProps = useMemo(() => {
    if (errorWithImage === null) {
      if (!isNil(src)) {
        return { src };
      } else if (!isNil(user) && model.user.isUserWithImage(user)) {
        return { user };
      }
      return null;
    }
    return null;
  }, [src, errorWithImage, user]);

  if (!isNil(userImageSrcProps)) {
    return (
      <UserImage
        overlay={imageOverlay}
        {...userImageSrcProps}
        {...props}
        {...imageProps}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => setErrorWithImage(e)}
      />
    );
  } else {
    return (
      <UserInitials
        overlay={initialsOverlay}
        {...props}
        user={user}
        className={initialsClassName}
        style={initialsStyle}
      />
    );
  }
};

export default React.memo(UserImageOrInitials);
