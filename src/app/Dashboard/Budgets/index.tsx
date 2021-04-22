import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, filter, isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { Page } from "components/layout";
import { EditBudgetModal } from "components/modals";
import { ModelSelectController } from "components/tables";

import {
  requestBudgetsAction,
  selectBudgetsAction,
  deleteBudgetAction,
  updateBudgetInStateAction,
  selectAllBudgetsAction
} from "../actions";
import BudgetCard from "./BudgetCard";
import "./index.scss";

const selectBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.data;
const selectSelectedBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.selected;
const selectDeletingBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.deleting;
const selectLoadingBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.loading;

const Budgets = (): JSX.Element => {
  const [budgetToEdit, setBudgetToEdit] = useState<Model.Budget | undefined>(undefined);
  const [budgetsToDelete, setBudgetsToDelete] = useState<Model.Budget[] | undefined>(undefined);

  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const selected = useSelector(selectSelectedBudgets);
  const deleting = useSelector(selectDeletingBudgets);
  const loading = useSelector(selectLoadingBudgets);

  useEffect(() => {
    dispatch(requestBudgetsAction(null));
  }, []);

  return (
    <Page className={"budgets"} loading={loading} title={"Budgets"}>
      <ModelSelectController<Model.Budget>
        selected={selected}
        data={budgets}
        entityName={"budget"}
        checkable={true}
        style={{ marginLeft: 13 }}
        onCheckboxChange={() => dispatch(selectAllBudgetsAction(null))}
        items={[
          {
            actionName: "Delete",
            icon: <FontAwesomeIcon icon={faTrashAlt} />,
            onClick: (bs: Model.Budget[]) => setBudgetsToDelete(bs)
          }
        ]}
      />
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
              selected={includes(selected, budget.id)}
              onSelect={(checked: boolean) => {
                if (checked === true) {
                  if (includes(selected, budget.id)) {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state: Budget ${budget.id} unexpectedly in selected
                      budgets state.`
                    );
                  } else {
                    dispatch(selectBudgetsAction([...selected, budget.id]));
                  }
                } else {
                  if (!includes(selected, budget.id)) {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state: Budget ${budget.id} expected to be in selected
                      budgets state but was not found.`
                    );
                  } else {
                    const ids = filter(selected, (id: number) => id !== budget.id);
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
