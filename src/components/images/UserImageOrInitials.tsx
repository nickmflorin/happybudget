import { useState } from "react";

import * as typeguards from "lib/model/typeguards";
import UserImage, { UserImageProps } from "./UserImage";
import UserInitials, { UserInitialsProps } from "./UserInitials";
import { isNil } from "lodash";

export interface UserImageOrInitialsProps extends StandardComponentProps {
  readonly user?: Model.User | Model.SimpleUser | Model.Contact;
  readonly src?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly initials?: string | null;
  readonly initialsProps?: Omit<UserInitialsProps, "user" | "firstName" | "lastName" | "initials">;
  readonly imageProps?: Omit<UserImageProps, "user" | "src">;
  readonly circle?: boolean;
  readonly overlay?: () => JSX.Element;
}

const UserImageOrInitials = ({
  user,
  src,
  imageProps,
  initialsProps,
  firstName,
  lastName,
  initials,
  overlay,
  ...props
}: UserImageOrInitialsProps): JSX.Element => {
  // If there is an error loading the image, we want to fallback to the initials
  // but still log that the error occurred.
  const [errorWithImage, setErrorWithImage] = useState<React.SyntheticEvent<HTMLImageElement> | null>(null);
  if (!isNil(src) && errorWithImage === null) {
    return (
      <UserImage
        src={src}
        overlay={overlay}
        {...props}
        {...imageProps}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => setErrorWithImage(e)}
      />
    );
  } else if (!isNil(user) && typeguards.isUserWithImage(user) && errorWithImage === null) {
    return (
      <UserImage
        user={user}
        overlay={overlay}
        {...props}
        {...imageProps}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => setErrorWithImage(e)}
      />
    );
  } else {
    return (
      <UserInitials
        {...props}
        {...initialsProps}
        user={user}
        initials={initials}
        firstName={firstName}
        lastName={lastName}
      />
    );
  }
};

export default UserImageOrInitials;
