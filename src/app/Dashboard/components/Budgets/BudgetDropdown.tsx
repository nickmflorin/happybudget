import React from "react";
import { Dropdown, Icon } from "components";

interface BudgetDropdownProps {
  readonly children: JSX.Element;
  readonly onNewBudget: () => void;
}

const BudgetDropdown: React.FC<BudgetDropdownProps> = ({ children, onNewBudget }): JSX.Element => {
  return (
    <Dropdown
      menuItems={[
        {
          id: "new-blank-budget",
          label: "New Blank Budget",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onNewBudget()
        }
      ]}
      placement={"bottomLeft"}
    >
      {children}
    </Dropdown>
  );
};

export default BudgetDropdown;
