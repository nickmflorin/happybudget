import { Icon } from "components";
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
                icon: <Icon icon={"edit"} weight={"light"} />,
                onClick: () => onEdit()
              },
              {
                id: "edit_name_image",
                text: "Edit Name/Image",
                icon: <Icon icon={"image"} weight={"light"} />,
                onClick: () => onEditNameImage()
              },
              {
                id: "duplicate",
                text: "Duplicate",
                icon: <Icon icon={"clone"} weight={"light"} />,
                onClick: () => onDuplicate(),
                loading: duplicating
              },
              {
                id: "hide_show",
                text: template.hidden === true ? "Show" : "Hide",
                icon: <Icon weight={"light"} icon={template.hidden === true ? "eye" : "eye-slash"} />,
                onClick: () => onToggleVisibility(),
                loading: hidingOrShowing
              },
              {
                id: "delete",
                text: "Delete",
                icon: <Icon icon={"trash"} weight={"light"} />,
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
