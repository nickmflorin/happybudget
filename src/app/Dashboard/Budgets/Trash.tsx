import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { map } from "lodash";

import { Page } from "components/layout";

import { ActionDomains, requestBudgetsAction, restoreBudgetAction, permanentlyDeleteBudgetAction } from "../actions";
import { BudgetTrashCard } from "./Card";
import "./index.scss";

const Trash = (): JSX.Element => {
  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector((state: Redux.ApplicationStore) => state.dashboard.budgets.trash);

  useEffect(() => {
    dispatch(requestBudgetsAction(ActionDomains.TRASH));
  }, []);

  return (
    <Page className={"budgets"} loading={budgets.loading} title={"Deleted Budgets"}>
      <div className={"budgets-grid"}>
        {map(budgets.data, (budget: Model.Budget) => {
          return (
            <BudgetTrashCard
              budget={budget}
              onRestore={(b: Model.Budget) => dispatch(restoreBudgetAction(b.id))}
              onDelete={(b: Model.Budget) => dispatch(permanentlyDeleteBudgetAction(b.id))}
            />
          );
        })}
      </div>
    </Page>
  );
};

export default Trash;
