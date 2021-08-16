import React from "react";
import { Dropdown, Icon } from "components";

interface BudgetDropdownProps {
  readonly children: JSX.Element;
  onNewBudget: () => void;
}

const BudgetDropdown: React.FC<BudgetDropdownProps> = ({ children, onNewBudget, ...props }): JSX.Element => {
  return (
    <Dropdown
      items={[
        {
          id: "new-blank-budget",
          text: "New Blank Budget",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onNewBudget()
        }
      ]}
      placement={"bottomLeft"}
      trigger={["click"]}
    >
      {children}
    </Dropdown>
  );
};

export default BudgetDropdown;
