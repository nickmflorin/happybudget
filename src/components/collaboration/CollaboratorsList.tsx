import React from "react";
import { map } from "lodash";
import classNames from "classnames";

import CollaboratorListItem from "./CollaboratorListItem";

type CollaboratorsListProps = StandardComponentProps & {
  readonly collaborators: Model.Collaborator[];
  readonly onRemoveCollaborator: (c: Model.Collaborator) => void;
};

const CollaboratorsList = ({ collaborators, onRemoveCollaborator, ...props }: CollaboratorsListProps) => (
  <div {...props} className={classNames("collaborators-list", props.className)}>
    {map(collaborators, (c: Model.Collaborator, i: number) => (
      <CollaboratorListItem key={i} collaborator={c} onClear={() => onRemoveCollaborator(c)} />
    ))}
  </div>
);

export default React.memo(CollaboratorsList);
