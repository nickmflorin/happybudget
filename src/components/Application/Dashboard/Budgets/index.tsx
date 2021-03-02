import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { map } from "lodash";

import { RenderOrSpinner } from "components/display";
import { requestBudgetsAction } from "../actions";
import BudgetCard from "./BudgetCard";

const Content = (): JSX.Element => {
  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector((state: Redux.IApplicationStore) => state.dashboard.budgets);

  useEffect(() => {
    dispatch(requestBudgetsAction());
  }, []);

  return (
    <RenderOrSpinner loading={budgets.loading}>
      <React.Fragment>
        <div>{"Budgets"}</div>
        <div className={"budgets"}>
          {map(budgets.data, (budget: IBudget) => {
            return <BudgetCard budget={budget} />;
          })}
        </div>
      </React.Fragment>
    </RenderOrSpinner>
  );
};

export default Content;
