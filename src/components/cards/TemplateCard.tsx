import { Icon } from "components";
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
      image={template.image}
      dropdown={[
        {
          id: "edit",
          label: "Edit",
          icon: <Icon icon={"edit"} weight={"light"} />,
          onClick: () => onEdit()
        },
        {
          id: "edit_name_image",
          label: "Edit Name/Image",
          icon: <Icon icon={"image"} weight={"light"} />,
          onClick: () => onEditNameImage()
        },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <Icon icon={"clone"} weight={"light"} />,
          onClick: () => onDuplicate(),
          loading: duplicating
        },
        {
          id: "move",
          label: "Move to Community",
          icon: <Icon icon={"user-friends"} weight={"light"} />,
          onClick: () => onMoveToCommunity(),
          visible: user.is_staff === true,
          loading: moving
        },
        {
          id: "delete",
          label: "Delete",
          icon: <Icon icon={"trash"} weight={"light"} />,
          onClick: () => onDelete(),
          loading: deleting
        }
      ]}
    />
  );
};

export default TemplateCard;
