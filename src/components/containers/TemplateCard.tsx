import React, { useEffect } from "react";
import { isNil } from "lodash";

import { Icon } from "components";
import * as store from "store";

import Card, { CardProps } from "./Card";

type TemplateCardProps = Pick<CardProps, "disabled" | "loading" | "onClick" | "className" | "style"> & {
  readonly template: Model.SimpleTemplate;
  readonly duplicating: boolean;
  readonly moving: boolean;
  readonly deleting: boolean;
  readonly onEdit: () => void;
  readonly onEditNameImage: () => void;
  readonly onDelete: (e: MenuItemModelClickEvent) => void;
  readonly onMoveToCommunity: (e: MenuItemModelClickEvent) => void;
  readonly onDuplicate: (e: MenuItemModelClickEvent) => void;
};

const TemplateCard = ({
  template,
  duplicating,
  deleting,
  moving,
  onDuplicate,
  onEditNameImage,
  onEdit,
  onDelete,
  onMoveToCommunity,
  ...props
}: TemplateCardProps): JSX.Element => {
  const user = store.hooks.useLoggedInUser();

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
      {...props}
      style={{ height: 194 }}
      title={template.name}
      tourId={template.name}
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
          onClick: (e: MenuItemModelClickEvent) => onDuplicate(e),
          keepDropdownOpenOnClick: true,
          loading: duplicating,
          disabled: duplicating
        },
        {
          id: "move",
          label: "Move to Community",
          icon: <Icon icon={"user-friends"} weight={"light"} />,
          onClick: (e: MenuItemModelClickEvent) => onMoveToCommunity(e),
          keepDropdownOpenOnClick: true,
          visible: user.is_staff === true,
          loading: moving,
          disabled: moving
        },
        {
          id: "delete",
          label: "Delete",
          icon: <Icon icon={"trash"} weight={"light"} />,
          onClick: (e: MenuItemModelClickEvent) => onDelete(e),
          keepDropdownOpenOnClick: true,
          loading: deleting,
          disabled: deleting
        }
      ]}
    />
  );
};

export default React.memo(TemplateCard);
