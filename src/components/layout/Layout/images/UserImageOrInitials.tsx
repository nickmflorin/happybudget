import { useState, useMemo } from "react";

import * as typeguards from "lib/model/typeguards";
import UserImage, { UserImageProps } from "./UserImage";
import UserInitials, { UserInitialsProps } from "./UserInitials";
import { isNil } from "lodash";
import { useEffect } from "react";

export interface UserImageOrInitialsProps
  extends StandardComponentProps,
    Omit<UserInitialsProps, StandardComponentPropNames> {
  readonly user?: Model.User | Model.SimpleUser | Model.Contact;
  readonly src?: string | null;
  readonly initialsStyle?: React.CSSProperties;
  readonly initialsClassName?: string;
  readonly imageProps?: Omit<UserImageProps, "user" | "src">;
  readonly circle?: boolean;
  readonly overlay?: () => JSX.Element;
}

const UserImageOrInitials = ({
  user,
  src,
  imageProps,
  overlay,
  initialsStyle,
  initialsClassName,
  ...props
}: UserImageOrInitialsProps): JSX.Element => {
  // If there is an error loading the image, we want to fallback to the initials
  // but still log that the error occurred.
  const [errorWithImage, setErrorWithImage] = useState<React.SyntheticEvent<HTMLImageElement> | null>(null);

  useEffect(() => {
    setErrorWithImage(null);
  }, [src]);

  const userImageSrcProps = useMemo(() => {
    if (errorWithImage === null) {
      if (!isNil(src)) {
        return { src };
      } else if (!isNil(user) && typeguards.isUserWithImage(user)) {
        return { user };
      }
      return null;
    }
    return null;
  }, [src, errorWithImage, user]);

  if (!isNil(userImageSrcProps)) {
    return (
      <UserImage
        overlay={overlay}
        {...userImageSrcProps}
        {...props}
        {...imageProps}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => setErrorWithImage(e)}
      />
    );
  } else {
    return <UserInitials {...props} user={user} className={initialsClassName} style={initialsStyle} />;
  }
};

export default UserImageOrInitials;
