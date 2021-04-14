import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, filter } from "lodash";

import { Page } from "components/layout";

import { ActionDomains, requestBudgetsAction, selectBudgetsAction, deleteBudgetAction } from "../actions";
import { BudgetCard } from "./Card";
import "./index.scss";

const Budgets = (): JSX.Element => {
  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector((state: Redux.ApplicationStore) => state.dashboard.budgets.active);

  useEffect(() => {
    dispatch(requestBudgetsAction(ActionDomains.ACTIVE));
  }, []);

  return (
    <Page className={"budgets"} loading={budgets.loading} title={"Budgets"}>
      <div className={"budgets-grid"}>
        {map(budgets.data, (budget: Model.Budget, index: number) => {
          return (
            <BudgetCard
              key={index}
              budget={budget}
              loading={includes(
                map(budgets.deleting, (instance: Redux.ModelListActionInstance) => instance.id),
                budget.id
              )}
              selected={includes(budgets.selected, budget.id)}
              onSelect={(checked: boolean) => {
                if (checked === true) {
                  if (includes(budgets.selected, budget.id)) {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state: Budget ${budget.id} unexpectedly in selected
                      budgets state.`
                    );
                  } else {
                    dispatch(selectBudgetsAction(ActionDomains.ACTIVE, [...budgets.selected, budget.id]));
                  }
                } else {
                  if (!includes(budgets.selected, budget.id)) {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state: Budget ${budget.id} expected to be in selected
                      budgets state but was not found.`
                    );
                  } else {
                    const ids = filter(budgets.selected, (id: number) => id !== budget.id);
                    dispatch(selectBudgetsAction(ActionDomains.ACTIVE, ids));
                  }
                }
              }}
              onEdit={(b: Model.Budget) => console.log(b)}
              onDelete={(b: Model.Budget) => dispatch(deleteBudgetAction(b.id))}
            />
          );
        })}
      </div>
    </Page>
  );
};

export default Budgets;
