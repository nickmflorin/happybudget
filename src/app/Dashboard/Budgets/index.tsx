import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, filter, isNil } from "lodash";

import { Page } from "components/layout";
import { EditBudgetModal } from "components/modals";

import { requestBudgetsAction, selectBudgetsAction, deleteBudgetAction, updateBudgetInStateAction } from "../actions";
import BudgetCard from "./BudgetCard";
import "./index.scss";

const Budgets = (): JSX.Element => {
  const [budgetToEdit, setBudgetToEdit] = useState<Model.Budget | undefined>(undefined);
  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector((state: Redux.ApplicationStore) => state.dashboard.budgets);

  useEffect(() => {
    dispatch(requestBudgetsAction(null));
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
                    dispatch(selectBudgetsAction([...budgets.selected, budget.id]));
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
                    dispatch(selectBudgetsAction(ids));
                  }
                }
              }}
              onEdit={() => setBudgetToEdit(budget)}
              onDelete={() => dispatch(deleteBudgetAction(budget.id))}
            />
          );
        })}
      </div>
      {!isNil(budgetToEdit) && (
        <EditBudgetModal
          open={true}
          budget={budgetToEdit}
          onCancel={() => setBudgetToEdit(undefined)}
          onSuccess={(budget: Model.Budget) => {
            setBudgetToEdit(undefined);
            dispatch(updateBudgetInStateAction({ id: budget.id, data: budget }));
          }}
        />
      )}
    </Page>
  );
};

export default Budgets;
