import { useEffect, useMemo } from "react";

import { Icon } from "components";
import { useLoggedInUser, useTimezone } from "store/hooks";
import { util } from "lib";

import Card from "./Card";
import { isNil } from "lodash";

interface BudgetCardProps {
  readonly budget: Model.Budget;
  readonly loading?: boolean;
  readonly deleting: boolean;
  readonly duplicating: boolean;
  readonly onEdit: () => void;
  readonly onClick: () => void;
  readonly onDelete: (e: MenuItemClickEvent<MenuItemModel>) => void;
  readonly onDuplicate: (e: MenuItemClickEvent<MenuItemModel>) => void;
}

const BudgetCard = ({
  budget,
  loading,
  deleting,
  duplicating,
  onEdit,
  onDelete,
  onClick,
  onDuplicate
}: BudgetCardProps): JSX.Element => {
  const user = useLoggedInUser();
  const tz = useTimezone();

  const subTitle = useMemo(() => {
    if (util.dates.isToday(budget.updated_at)) {
      return `Last edited ${util.dates.toDisplayTimeSince(budget.updated_at)} by ${user.full_name}`;
    }
    return `Last edited by ${user.full_name} on ${util.dates.toAbbvDisplayDateTime(budget.updated_at, { tz })}`;
  }, [budget.updated_at, user.full_name]);

  useEffect(() => {
    if (!isNil(budget.image) && isNil(budget.image.url)) {
      console.warn(
        `Budget ${budget.id} has an image with an undefined URL.
        This most likely means something wonky is going on with S3.`
      );
    }
  }, [budget.image]);

  return (
    <Card
      className={"budget-card"}
      onClick={() => onClick()}
      title={budget.name}
      subTitle={subTitle}
      loading={loading}
      image={budget.image}
      dropdown={[
        {
          id: "edit",
          label: "Edit Name/Image",
          icon: <Icon icon={"image"} weight={"light"} />,
          onClick: () => onEdit()
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

export default BudgetCard;
