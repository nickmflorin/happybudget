import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faImage, faTrash } from "@fortawesome/pro-light-svg-icons";

import { useLoggedInUser } from "store/hooks";

import Card from "./Card";

interface CommunityTemplateCardProps {
  template: Model.Template;
  loading: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onEditNameImage: () => void;
  onClick: () => void;
}

const CommunityTemplateCard = ({
  template,
  loading,
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
      dropdown={
        /* eslint-disable indent */
        user.is_staff
          ? [
              {
                text: "Edit",
                icon: <FontAwesomeIcon className={"icon"} icon={faEdit} />,
                onClick: () => onEdit()
              },
              {
                text: "Edit Name/Image",
                icon: <FontAwesomeIcon className={"icon"} icon={faImage} />,
                onClick: () => onEditNameImage()
              },
              {
                text: "Delete",
                icon: <FontAwesomeIcon className={"icon"} icon={faTrash} />,
                onClick: () => onDelete()
              }
            ]
          : undefined
      }
    />
  );
};

export default CommunityTemplateCard;
