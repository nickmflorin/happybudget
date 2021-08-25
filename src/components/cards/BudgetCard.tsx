import { useMemo } from "react";

import { Icon } from "components";
import { useLoggedInUser, useTimezone } from "store/hooks";
import { util } from "lib";

import Card from "./Card";

interface BudgetCardProps {
  budget: Model.Budget;
  loading?: boolean;
  deleting: boolean;
  onDelete: (e: MenuItemClickEvent<MenuItemModel>) => void;
  onEdit: () => void;
  onClick: () => void;
}

const BudgetCard = ({ budget, loading, deleting, onEdit, onDelete, onClick }: BudgetCardProps): JSX.Element => {
  const user = useLoggedInUser();
  const tz = useTimezone();

  const subTitle = useMemo(() => {
    if (util.dates.isToday(budget.updated_at)) {
      return `Last edited ${util.dates.toDisplayTimeSince(budget.updated_at)} by ${user.full_name}`;
    }
    return `Last edited by ${user.full_name} on ${util.dates.toAbbvDisplayDateTime(budget.updated_at, { tz })}`;
  }, [budget.updated_at, user.full_name]);

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
