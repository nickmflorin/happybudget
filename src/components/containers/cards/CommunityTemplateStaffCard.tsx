import React from "react";
import classNames from "classnames";

import { Icon } from "components";

import BaseBudgetCard, { BaseBudgetCardProps } from "./BaseBudgetCard";

type CommunityTemplateStaffCardProps = Omit<BaseBudgetCardProps<Model.SimpleTemplate>, "dropdown" | "cornerActions"> & {
  readonly deleting: boolean;
  readonly duplicating: boolean;
  readonly hidingOrShowing: boolean;
  readonly onEdit: () => void;
  readonly onEditNameImage: () => void;
  readonly onDuplicate: (e: MenuItemModelClickEvent) => void;
  readonly onToggleVisibility: (e: MenuItemModelClickEvent) => void;
  readonly onDelete: (e: MenuItemModelClickEvent) => void;
};

const CommunityTemplateStaffCard = ({
  duplicating,
  deleting,
  hidingOrShowing,
  onToggleVisibility,
  onDuplicate,
  onEditNameImage,
  onEdit,
  onDelete,
  ...props
}: CommunityTemplateStaffCardProps): JSX.Element => (
  <BaseBudgetCard
    {...props}
    className={classNames("community-template-admin-card", props.className, { hidden: props.budget.hidden })}
    cornerActions={(iconClassName: string) => [
      {
        render: () => (
          <Icon className={classNames("icon--card-corner-action", iconClassName)} icon={"eye-slash"} weight={"solid"} />
        ),
        visible: props.budget.hidden === true
      }
    ]}
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
        loading: duplicating
      },
      {
        id: "hide_show",
        label: props.budget.hidden === true ? "Show" : "Hide",
        icon: <Icon weight={"light"} icon={props.budget.hidden === true ? "eye" : "eye-slash"} />,
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
    ]}
  />
);

export default React.memo(CommunityTemplateStaffCard);
