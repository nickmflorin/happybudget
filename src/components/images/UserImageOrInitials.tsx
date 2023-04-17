import React, { useEffect, useState, useMemo } from "react";

import { model, ui } from "lib";

import { UserImage, UserImageProps } from "./UserImage";
import { UserInitials, UserInitialsProps } from "./UserInitials";

export type UserImageOrInitialsProps = ui.ComponentProps<
  Omit<UserInitialsProps, keyof ui.ComponentProps> & {
    readonly user?: model.User | model.SimpleUser | model.Contact;
    readonly src?: string | null;
    readonly initialsStyle?: ui.Style;
    readonly initialsClassName?: string;
    readonly imageProps?: Omit<UserImageProps, "user" | "src">;
    readonly circle?: boolean;
    readonly imageOverlay?: () => JSX.Element;
    readonly initialsOverlay?: () => JSX.Element;
  }
>;

export const UserImageOrInitials = ({
  user,
  src,
  imageProps,
  imageOverlay,
  initialsOverlay,
  initialsStyle,
  initialsClassName,
  ...props
}: UserImageOrInitialsProps): JSX.Element => {
  /* If there is an error loading the image, we want to fallback to the initials but still log that
     the error occurred. */
  const [errorWithImage, setErrorWithImage] =
    useState<React.SyntheticEvent<HTMLImageElement> | null>(null);

  useEffect(() => {
    setErrorWithImage(null);
  }, [src]);

  const userImageSrcProps = useMemo(() => {
    if (errorWithImage !== null) {
      return null;
    } else if (src !== undefined) {
      return { src };
    } else if (user !== undefined && model.isUserWithImage(user)) {
      return { user };
    }
    return null;
  }, [src, errorWithImage, user]);

  if (userImageSrcProps !== null) {
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
