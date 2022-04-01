import React from "react";
import classNames from "classnames";
import { map } from "lodash";

import { model } from "lib";

import { ClearButton } from "components/buttons";
import { Select } from "components/fields";
import { UserImageOrInitials } from "components/images";

type CollaboratorListItemProps = StandardComponentProps & {
  readonly deleting: boolean;
  readonly updating: boolean;
  readonly collaborator: Model.Collaborator;
  readonly onDelete: () => void;
  readonly onChangeAccessType: (ac: Model.CollaboratorAccessTypeId) => void;
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
    <Select
      style={{ width: 150 }}
      value={collaborator.access_type.id}
      options={map(model.budgeting.CollaboratorAccessTypes.choices, (ch: Model.CollaboratorAccessType) => ({
        value: ch.id,
        label: ch.name
      }))}
      onChange={(ac: Model.CollaboratorAccessTypeId) => onChangeAccessType(ac)}
    />
    <ClearButton onClick={() => onDelete()} />
  </div>
);

export default React.memo(CollaboratorListItem);
