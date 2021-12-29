import React from "react";
import { useHistory } from "react-router-dom";

import { Icon } from "components";
import { DropdownMenu } from "components/dropdowns";

interface BudgetDropdownProps {
  readonly children: JSX.Element;
  readonly onNewBudget: () => void;
}

const BudgetDropdown: React.FC<BudgetDropdownProps> = ({ children, onNewBudget }): JSX.Element => {
  const history = useHistory();

  return (
    <DropdownMenu
      models={[
        {
          id: "new-blank-budget",
          label: "New Blank Budget",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onNewBudget()
        },
        {
          id: "start-from-template",
          label: "Start from Template ",
          icon: <Icon icon={"image"} weight={"light"} />,
          onClick: () => history.push("/discover")
        }
      ]}
      placement={"bottomLeft"}
    >
      {children}
    </DropdownMenu>
  );
};

export default React.memo(BudgetDropdown);
