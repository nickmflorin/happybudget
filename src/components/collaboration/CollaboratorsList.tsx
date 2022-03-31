import React from "react";
import { map } from "lodash";
import classNames from "classnames";

type CollaboratorsListProps = StandardComponentProps & {
  readonly collaborators: Model.Collaborator[];
};

const CollaboratorsList = ({ collaborators, ...props }: CollaboratorsListProps) => (
  <div {...props} className={classNames("collaborators-list", props.className)}>
    {map(collaborators, (c: Model.Collaborator, i: number) => (
      <h1 key={i}>{c.user.full_name}</h1>
    ))}
  </div>
);

export default React.memo(CollaboratorsList);
