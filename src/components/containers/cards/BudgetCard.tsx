import React from "react";

import { Icon } from "components";
import GenericOwnedBudgetCard, { GenericOwnedBudgetCardProps } from "./GenericOwnedBudgetCard";

type BudgetCardProps = Omit<GenericOwnedBudgetCardProps, "dropdown"> & {
  readonly duplicating: boolean;
  readonly onDuplicate: (e: MenuItemModelClickEvent) => void;
};

const BudgetCard = ({ duplicating, onDuplicate, ...props }: BudgetCardProps): JSX.Element => (
  <GenericOwnedBudgetCard
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
