import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { map } from "lodash";

import { Page } from "components/layout";

import { requestBudgetsAction } from "../actions";
import BudgetCard from "./BudgetCard";
import "./index.scss";

const Content = (): JSX.Element => {
  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector((state: Redux.IApplicationStore) => state.dashboard.budgets);

  useEffect(() => {
    dispatch(requestBudgetsAction());
  }, []);

  return (
    <Page className={"budgets"} loading={budgets.loading} title={"Budgets"}>
      <div className={"budgets-grid"}>
        {map(budgets.data, (budget: IBudget) => {
          return <BudgetCard budget={budget} />;
        })}
      </div>
    </Page>
  );
};

export default Content;
