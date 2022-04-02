import React from "react";

import { Icon } from "components";
import UserBudgetCard, { UserBudgetCardProps } from "./UserBudgetCard";

type BudgetCardProps = Omit<UserBudgetCardProps, "dropdown"> & {
  readonly duplicating: boolean;
  readonly onDuplicate: (e: MenuItemModelClickEvent) => void;
};

const BudgetCard = ({ duplicating, onDuplicate, ...props }: BudgetCardProps): JSX.Element => (
  <UserBudgetCard
    {...props}
    dropdown={[
      {
        id: "duplicate",
        label: "Duplicate",
        icon: <Icon icon={"clone"} weight={"light"} />,
        onClick: (e: MenuItemModelClickEvent) => onDuplicate(e),
        keepDropdownOpenOnClick: true,
        loading: duplicating,
        disabled: duplicating
      }
    ]}
  />
);

export default React.memo(BudgetCard);
