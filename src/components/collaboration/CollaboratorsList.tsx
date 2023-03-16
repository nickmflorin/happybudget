import React from "react";

import classNames from "classnames";
import { map } from "lodash";

import CollaboratorListItem from "./CollaboratorListItem";

type CollaboratorsListProps = StandardComponentProps & {
  readonly collaborators: Model.Collaborator[];
  readonly onChangeAccessType: (
    c: Model.Collaborator,
    ac: Model.CollaboratorAccessType["id"],
  ) => void;
  readonly onRemoveCollaborator: (c: Model.Collaborator) => void;
  readonly isDeleting: (id: number) => boolean;
  readonly isUpdating: (id: number) => boolean;
};

const CollaboratorsList = ({
  collaborators,
  isDeleting,
  isUpdating,
  onChangeAccessType,
  onRemoveCollaborator,
  ...props
}: CollaboratorsListProps) => (
  <div {...props} className={classNames("collaborators-list", props.className)}>
    {map(collaborators, (c: Model.Collaborator, i: number) => (
      <CollaboratorListItem
        key={i}
        collaborator={c}
        deleting={isDeleting(c.id)}
        updating={isUpdating(c.id)}
        onChangeAccessType={(ac: Model.CollaboratorAccessType["id"]) => onChangeAccessType(c, ac)}
        onDelete={() => onRemoveCollaborator(c)}
      />
    ))}
  </div>
);

export default React.memo(CollaboratorsList);
