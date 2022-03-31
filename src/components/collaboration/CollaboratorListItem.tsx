import React from "react";
import classNames from "classnames";

import { ClearButton } from "components/buttons";
import { UserImageOrInitials } from "components/images";

type CollaboratorListItemProps = StandardComponentProps & {
  readonly collaborator: Model.Collaborator;
  readonly onClear: () => void;
};

const CollaboratorListItem = ({ collaborator, onClear, ...props }: CollaboratorListItemProps): JSX.Element => {
  return (
    <div {...props} className={classNames("collaborator-list-item", props.className)}>
      <div className={"user-image-or-initials-container"}>
        <UserImageOrInitials circle={true} user={collaborator.user} />
      </div>
      <div className={"name-container"}>{collaborator.user.full_name}</div>
      <ClearButton onClick={() => onClear()} />
    </div>
  );
};

export default React.memo(CollaboratorListItem);
