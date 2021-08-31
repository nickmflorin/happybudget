import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { Icon } from "components";
import { Button, CircleIconButton } from "components/buttons";
import { Input } from "components/fields";

import { setBudgetsSearchAction } from "../../store/actions";
import BudgetDropdown from "./BudgetDropdown";
import "./BudgetsSubTitle.scss";

interface BudgetsSubTitleProps extends StandardComponentProps {
  readonly onNewBudget: () => void;
}

const selectBudgetsSearch = (state: Application.Authenticated.Store) => state.dashboard.budgets.search;

const BudgetsSubTitle: React.FC<BudgetsSubTitleProps> = ({ onNewBudget, ...props }): JSX.Element => {
  const dispatch: Redux.Dispatch = useDispatch();
  const search = useSelector(selectBudgetsSearch);
  return (
    <div className={"budget-sub-title"}>
      <Input
        placeholder={"Search Projects..."}
        value={search}
        allowClear={true}
        prefix={<Icon icon={"search"} weight={"light"} />}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => dispatch(setBudgetsSearchAction(event.target.value))}
      />
      <BudgetDropdown onNewBudget={onNewBudget}>
        <CircleIconButton className={"btn--primary"} icon={<Icon icon={"plus"} weight={"light"} />} />
      </BudgetDropdown>
      <BudgetDropdown onNewBudget={onNewBudget}>
        <Button className={"btn--primary btn-non-circle"} icon={<Icon icon={"plus"} weight={"light"} />}>
          {"Create Budget"}
        </Button>
      </BudgetDropdown>
    </div>
  );
};

export default BudgetsSubTitle;
