import { useMemo } from "react";
import classNames from "classnames";
import * as typeguards from "lib/model/typeguards";
import Image, { ImageProps } from "./Image";
import { isNil } from "lodash";

export interface UserImageProps extends Omit<ImageProps, "src"> {
  readonly user?: Model.UserWithImage;
  readonly src?: string;
  readonly circle?: boolean;
}

const UserImage = ({ user, src, ...props }: UserImageProps): JSX.Element => {
  const imageSrc = useMemo<string | null>(
    () => (!isNil(src) ? src : !isNil(user) ? (typeguards.isContact(user) ? user.image : user.profile_image) : null),
    [user, src]
  );
  return !isNil(imageSrc) ? (
    <Image
      {...props}
      className={classNames("img--user", props.className)}
      src={imageSrc}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        /* eslint-disable no-console */
        console.error(`Error loading user image at src ${imageSrc}!`);
        console.error(e);
        !isNil(props.onError) && props.onError(e);
      }}
    />
  ) : (
    <></>
  );
};

export default UserImage;
