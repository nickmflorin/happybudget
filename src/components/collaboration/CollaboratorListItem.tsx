import classNames from "classnames";

import { ui, model } from "lib";
import { ClearButton } from "components/buttons";
import { UserImageOrInitials } from "components/images";
import { CollaboratorAccessTypeSelect } from "deprecated/components/fields";

type CollaboratorListItemProps = ui.ComponentProps<{
  readonly deleting: boolean;
  readonly updating: boolean;
  readonly collaborator: model.Collaborator;
  readonly onDelete: () => void;
  readonly onChangeAccessType: (ac: model.CollaboratorAccessType["id"]) => void;
}>;

export const CollaboratorListItem = ({
  collaborator,
  updating,
  deleting,
  onDelete,
  onChangeAccessType,
  ...props
}: CollaboratorListItemProps): JSX.Element => (
  <div
    {...props}
    className={classNames("collaborator-list-item", props.className, {
      loading: updating || deleting,
    })}
  >
    <div className="collaborator-list-item__user-image-or-initials-container">
      <UserImageOrInitials circle={true} user={collaborator.user} />
    </div>
    <div className="collaborator-list-item__name">{collaborator.user.full_name}</div>
    <div style={{ width: 110 }}>
      <CollaboratorAccessTypeSelect
        value={collaborator.access_type.id}
        onChange={(accessType: model.CollaboratorAccessType["id"] | null) => {
          /* Since the select will always be initialized with an access type,
             and it is not clearable, the value should never be null.  But we
             still have to type check to satisfy TS. */
          if (accessType !== null) {
            onChangeAccessType(accessType);
          }
        }}
      />
    </div>
    <ClearButton size={ui.ButtonSizes.SMALL} onClick={() => onDelete()} />
  </div>
);
