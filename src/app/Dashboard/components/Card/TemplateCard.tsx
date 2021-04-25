import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faUserFriends } from "@fortawesome/pro-solid-svg-icons";

import { useLoggedInUser, useTimezone } from "store/hooks";
import { toAbbvDisplayDateTime } from "lib/util/dates";

import Card from "./Card";

interface TemplateCardProps {
  template: Model.Template;
  loading: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onEditNameImage: () => void;
  onClick: () => void;
  onSaveAsCommunity: () => void;
}

const TemplateCard = ({
  template,
  loading,
  onClick,
  onEditNameImage,
  onEdit,
  onDelete,
  onSaveAsCommunity
}: TemplateCardProps): JSX.Element => {
  const user = useLoggedInUser();
  const tz = useTimezone();

  return (
    <Card
      onClick={() => onClick()}
      title={template.name}
      subTitle={`Last edited by ${user.full_name} on ${toAbbvDisplayDateTime(template.updated_at, { tz })}`}
      loading={loading}
      image={template.image}
      dropdown={[
        {
          text: "Edit",
          icon: <FontAwesomeIcon className={"icon"} icon={faEdit} />,
          onClick: () => onEdit()
        },
        {
          text: "Edit Name/Image",
          icon: <FontAwesomeIcon className={"icon"} icon={faEdit} />,
          onClick: () => onEditNameImage()
        },
        {
          text: "Save as Community",
          icon: <FontAwesomeIcon className={"icon"} icon={faUserFriends} />,
          onClick: () => onSaveAsCommunity(),
          visible: user.is_staff === true
        },
        {
          text: "Delete",
          icon: <FontAwesomeIcon className={"icon"} icon={faTrash} />,
          onClick: () => onDelete()
        }
      ]}
    />
  );
};

export default TemplateCard;
