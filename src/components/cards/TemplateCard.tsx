import { useEffect } from "react";
import { isNil } from "lodash";

import { Icon } from "components";
import { useLoggedInUser } from "store/hooks";

import Card from "./Card";

interface TemplateCardProps {
  template: Model.Template;
  loading?: boolean;
  duplicating: boolean;
  moving: boolean;
  deleting: boolean;
  onEdit: () => void;
  onEditNameImage: () => void;
  onClick: () => void;
  onDelete: (e: MenuItemClickEvent<MenuItemModel>) => void;
  onMoveToCommunity: (e: MenuItemClickEvent<MenuItemModel>) => void;
  onDuplicate: (e: MenuItemClickEvent<MenuItemModel>) => void;
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

  useEffect(() => {
    if (!isNil(template.image) && isNil(template.image.url)) {
      console.warn(
        `Template ${template.id} has an image with an undefined URL.
        This most likely means something wonky is going on with S3.`
      );
    }
  }, [template.image]);

  return (
    <Card
      className={"template-card"}
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
          onClick: (e: MenuItemClickEvent<MenuItemModel>) => onDuplicate(e),
          keepDropdownOpenOnClick: true,
          loading: duplicating,
          disabled: duplicating
        },
        {
          id: "move",
          label: "Move to Community",
          icon: <Icon icon={"user-friends"} weight={"light"} />,
          onClick: (e: MenuItemClickEvent<MenuItemModel>) => onMoveToCommunity(e),
          keepDropdownOpenOnClick: true,
          visible: user.is_staff === true,
          loading: moving,
          disabled: moving
        },
        {
          id: "delete",
          label: "Delete",
          icon: <Icon icon={"trash"} weight={"light"} />,
          onClick: (e: MenuItemClickEvent<MenuItemModel>) => onDelete(e),
          keepDropdownOpenOnClick: true,
          loading: deleting,
          disabled: deleting
        }
      ]}
    />
  );
};

export default TemplateCard;
