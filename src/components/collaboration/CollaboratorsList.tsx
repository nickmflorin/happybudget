import classNames from "classnames";

import { model, ui } from "lib";

import { CollaboratorListItem } from "./CollaboratorListItem";

type CollaboratorsListProps = ui.ComponentProps<{
  readonly collaborators: model.Collaborator[];
  readonly onChangeAccessType: (
    c: model.Collaborator,
    ac: model.CollaboratorAccessType["id"],
  ) => void;
  readonly onRemoveCollaborator: (c: model.Collaborator) => void;
  readonly isDeleting: (id: number) => boolean;
  readonly isUpdating: (id: number) => boolean;
}>;

export const CollaboratorsList = ({
  collaborators,
  isDeleting,
  isUpdating,
  onChangeAccessType,
  onRemoveCollaborator,
  ...props
}: CollaboratorsListProps) => (
  <div {...props} className={classNames("collaborators-list", props.className)}>
    {collaborators.map((c: model.Collaborator, i: number) => (
      <CollaboratorListItem
        key={i}
        collaborator={c}
        deleting={isDeleting(c.id)}
        updating={isUpdating(c.id)}
        onChangeAccessType={(ac: model.CollaboratorAccessType["id"]) => onChangeAccessType(c, ac)}
        onDelete={() => onRemoveCollaborator(c)}
      />
    ))}
  </div>
);
