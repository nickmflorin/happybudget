import React, { useEffect } from "react";
import { isNil } from "lodash";

import { Icon } from "components";
import { useLoggedInUser } from "store/hooks";

import Card from "./Card";

interface CommunityTemplateCardProps {
  template: Model.Template;
  loading?: boolean;
  duplicating: boolean;
  hidingOrShowing: boolean;
  deleting: boolean;
  onEdit: () => void;
  onEditNameImage: () => void;
  onClick: () => void;
  onDuplicate: (e: MenuItemModelClickEvent) => void;
  onToggleVisibility: (e: MenuItemModelClickEvent) => void;
  onDelete: (e: MenuItemModelClickEvent) => void;
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
      hidden={user.is_staff === true && template.hidden === true}
      dropdown={
        /* eslint-disable indent */
        user.is_staff
          ? [
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
                onClick: (e: MenuItemModelClickEvent) => onDuplicate(e),
                loading: duplicating
              },
              {
                id: "hide_show",
                label: template.hidden === true ? "Show" : "Hide",
                icon: <Icon weight={"light"} icon={template.hidden === true ? "eye" : "eye-slash"} />,
                onClick: (e: MenuItemModelClickEvent) => onToggleVisibility(e),
                loading: hidingOrShowing
              },
              {
                id: "delete",
                label: "Delete",
                icon: <Icon icon={"trash"} weight={"light"} />,
                onClick: (e: MenuItemModelClickEvent) => onDelete(e),
                loading: deleting
              }
            ]
          : undefined
      }
    />
  );
};

export default React.memo(CommunityTemplateCard);
