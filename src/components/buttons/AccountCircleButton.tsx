import classNames from "classnames";

import { UserImageOrInitials, UserImageOrInitialsProps } from "components/images";

import { ContentButton } from "./abstract";

export type AccountCircleButtonProps = UserImageOrInitialsProps & {
  readonly onClick?: () => void;
};

export const AccountCircleButton = ({
  id,
  className,
  style,
  onClick,
  ...props
}: AccountCircleButtonProps): JSX.Element => (
  <ContentButton
    id={id}
    className={classNames("btn--account-circle", className)}
    style={style}
    onClick={onClick}
  >
    <UserImageOrInitials {...props} />
  </ContentButton>
);
