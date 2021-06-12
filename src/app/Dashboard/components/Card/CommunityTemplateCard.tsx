import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faImage, faTrash, faClone, faEyeSlash, faEye } from "@fortawesome/pro-light-svg-icons";

import { useLoggedInUser } from "store/hooks";

import Card from "./Card";

interface CommunityTemplateCardProps {
  template: Model.Template;
  loading?: boolean;
  duplicating: boolean;
  hidingOrShowing: boolean;
  deleting: boolean;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onEditNameImage: () => void;
  onClick: () => void;
  onDuplicate: () => void;
}

const CommunityTemplateCard = ({
  template,
  loading,
  duplicating,
  deleting,
  hidingOrShowing,
  onToggleVisibility,
  onDuplicate,
  onClick,
  onEditNameImage,
  onEdit,
  onDelete
}: CommunityTemplateCardProps): JSX.Element => {
  const user = useLoggedInUser();

  return (
    <Card
      onClick={() => onClick()}
      title={template.name}
      loading={loading}
      image={template.image}
      hidden={user.is_staff === true && template.hidden === true}
      dropdown={
        /* eslint-disable indent */
        user.is_staff
          ? [
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
                id: "hide_show",
                text: template.hidden === true ? "Show" : "Hide",
                icon: <FontAwesomeIcon className={"icon"} icon={template.hidden === true ? faEye : faEyeSlash} />,
                onClick: () => onToggleVisibility(),
                loading: hidingOrShowing
              },
              {
                id: "delete",
                text: "Delete",
                icon: <FontAwesomeIcon className={"icon"} icon={faTrash} />,
                onClick: () => onDelete(),
                loading: deleting
              }
            ]
          : undefined
      }
    />
  );
};

export default CommunityTemplateCard;
