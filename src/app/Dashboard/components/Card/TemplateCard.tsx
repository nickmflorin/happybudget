import { isNil } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faEdit, faImage, faTrash, faUserFriends } from "@fortawesome/pro-light-svg-icons";

import { useLoggedInUser } from "store/hooks";

import Card from "./Card";

interface TemplateCardProps {
  template: Model.Template;
  loading?: boolean;
  duplicating: boolean;
  moving: boolean;
  deleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onEditNameImage: () => void;
  onClick: () => void;
  onMoveToCommunity: () => void;
  onDuplicate: () => void;
}

const TemplateCard = ({
  template,
  loading,
  duplicating,
  deleting,
  moving,
  onDuplicate,
  onClick,
  onEditNameImage,
  onEdit,
  onDelete,
  onMoveToCommunity
}: TemplateCardProps): JSX.Element => {
  const user = useLoggedInUser();
  return (
    <Card
      onClick={() => onClick()}
      title={template.name}
      loading={loading}
      image={!isNil(template.image) ? template.image.url : null}
      dropdown={[
        {
          id: "edit",
          text: "Edit",
          icon: <FontAwesomeIcon className={"icon"} icon={faEdit} />,
          onClick: () => onEdit()
        },
        {
          id: "edit_name_image",
          text: "Edit Name/Image",
          icon: <FontAwesomeIcon className={"icon"} icon={faImage} />,
          onClick: () => onEditNameImage()
        },
        {
          id: "duplicate",
          text: "Duplicate",
          icon: <FontAwesomeIcon className={"icon"} icon={faClone} />,
          onClick: () => onDuplicate(),
          loading: duplicating
        },
        {
          id: "move",
          text: "Move to Community",
          icon: <FontAwesomeIcon className={"icon"} icon={faUserFriends} />,
          onClick: () => onMoveToCommunity(),
          visible: user.is_staff === true,
          loading: moving
        },
        {
          id: "delete",
          text: "Delete",
          icon: <FontAwesomeIcon className={"icon"} icon={faTrash} />,
          onClick: () => onDelete(),
          loading: deleting
        }
      ]}
    />
  );
};

export default TemplateCard;
