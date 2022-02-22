import React, { useEffect, useMemo } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Icon } from "components";
import { users, util } from "lib";

import Card, { CardProps } from "./Card";

type CommunityTemplateStaffCardProps = Pick<CardProps, "disabled" | "loading" | "onClick" | "className" | "style"> & {
  budget: Model.SimpleTemplate;
  duplicating: boolean;
  hidingOrShowing: boolean;
  deleting: boolean;
  onEdit: () => void;
  onEditNameImage: () => void;
  onDuplicate: (e: MenuItemModelClickEvent) => void;
  onToggleVisibility: (e: MenuItemModelClickEvent) => void;
  onDelete: (e: MenuItemModelClickEvent) => void;
};

const CommunityTemplateStaffCard = ({
  budget,
  loading,
  duplicating,
  deleting,
  hidingOrShowing,
  onToggleVisibility,
  onDuplicate,
  onEditNameImage,
  onEdit,
  onDelete,
  ...props
}: CommunityTemplateStaffCardProps): JSX.Element => {
  const user = users.hooks.useLoggedInUser();
  const tz = users.hooks.useTimezone();

  const subTitle = useMemo(() => {
    if (util.dates.isToday(budget.updated_at)) {
      return `Last edited ${util.dates.toDisplayTimeSince(budget.updated_at)} by ${user.full_name}`;
    }
    return `Last edited by ${user.full_name} on ${util.dates.toAbbvDisplayDateTime(budget.updated_at, { tz })}`;
  }, [budget.updated_at, user.full_name]);

  useEffect(() => {
    if (!isNil(budget.image) && isNil(budget.image.url)) {
      console.warn(
        `Community Template ${budget.id} has an image with an undefined URL.
        This most likely means something wonky is going on with S3.`
      );
    }
  }, [budget.image]);

  return (
    <Card
      {...props}
      tourId={budget.name}
      className={classNames("community-template-admin-card", props.className, { hidden: budget.hidden })}
      cornerActions={(iconClassName: string) => [
        {
          render: () => (
            <Icon
              className={classNames("icon--card-corner-action", iconClassName)}
              icon={"eye-slash"}
              weight={"solid"}
            />
          ),
          visible: budget.hidden === true
        }
      ]}
      title={budget.name}
      subTitle={subTitle}
      loading={loading}
      image={budget.image}
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
          label: budget.hidden === true ? "Show" : "Hide",
          icon: <Icon weight={"light"} icon={budget.hidden === true ? "eye" : "eye-slash"} />,
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
};

export default React.memo(CommunityTemplateStaffCard);
