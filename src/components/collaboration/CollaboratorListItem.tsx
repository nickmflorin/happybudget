import React from "react";
import classNames from "classnames";

import { ClearButton } from "components/buttons";
import { CollaboratorAccessTypeSelect } from "components/fields";
import { UserImageOrInitials } from "components/images";

type CollaboratorListItemProps = StandardComponentProps & {
  readonly deleting: boolean;
  readonly updating: boolean;
  readonly collaborator: Model.Collaborator;
  readonly onDelete: () => void;
  readonly onChangeAccessType: (ac: Model.CollaboratorAccessType["id"]) => void;
};

const CollaboratorListItem = ({
  collaborator,
  updating,
  deleting,
  onDelete,
  onChangeAccessType,
  ...props
}: CollaboratorListItemProps): JSX.Element => (
  <div {...props} className={classNames("collaborator-list-item", props.className, { loading: updating || deleting })}>
    <div className={"user-image-or-initials-container"}>
      <UserImageOrInitials circle={true} user={collaborator.user} />
    </div>
    <div className={"name-container"}>{collaborator.user.full_name}</div>
    <div style={{ width: 110 }}>
      <CollaboratorAccessTypeSelect
        value={collaborator.access_type.id}
        onChange={(accessType: Model.CollaboratorAccessType["id"] | null) => {
          /* Since the select will always be initialized with an access type,
             and it is not clearable, the value should never be null.  But we
             still have to type check to satisfy TS. */
          if (accessType !== null) {
            onChangeAccessType(accessType);
          }
        }}
      />
    </div>
    <ClearButton iconSize={"small"} onClick={() => onDelete()} />
  </div>
);

export default React.memo(CollaboratorListItem);
