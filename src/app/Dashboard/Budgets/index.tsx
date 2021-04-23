import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, isNil } from "lodash";

import { Page } from "components/layout";
import { EditBudgetModal } from "components/modals";

import { requestBudgetsAction, deleteBudgetAction, updateBudgetInStateAction } from "../actions";
import BudgetCard from "./BudgetCard";
import "./index.scss";

const selectBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.data;
const selectDeletingBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.deleting;
const selectLoadingBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.loading;

const Budgets = (): JSX.Element => {
  const [budgetToEdit, setBudgetToEdit] = useState<Model.Budget | undefined>(undefined);

  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const deleting = useSelector(selectDeletingBudgets);
  const loading = useSelector(selectLoadingBudgets);

  useEffect(() => {
    dispatch(requestBudgetsAction(null));
  }, []);

  return (
    <Page className={"budgets"} loading={loading} title={"Budgets"}>
      <div className={"budgets-grid"}>
        {map(budgets, (budget: Model.Budget, index: number) => {
          return (
            <BudgetCard
              key={index}
              budget={budget}
              loading={includes(
                map(deleting, (instance: Redux.ModelListActionInstance) => instance.id),
                budget.id
              )}
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
