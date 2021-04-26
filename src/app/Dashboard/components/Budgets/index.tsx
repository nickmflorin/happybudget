import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Dispatch } from "redux";
import { includes, map, isNil } from "lodash";

import { Page } from "components/layout";
import { EditBudgetModal, CreateBudgetModal } from "components/modals";

import {
  requestBudgetsAction,
  deleteBudgetAction,
  updateBudgetInStateAction,
  addBudgetToStateAction
} from "../../store/actions";
import { EmptyCard, BudgetCard } from "../Card";
import "./index.scss";

const selectBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.data;
const selectObjLoadingBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.objLoading;
const selectLoadingBudgets = (state: Redux.ApplicationStore) => state.dashboard.budgets.loading;

const Budgets = (): JSX.Element => {
  const [budgetToEdit, setBudgetToEdit] = useState<Model.Budget | undefined>(undefined);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const history = useHistory();

  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const objLoading = useSelector(selectObjLoadingBudgets);
  const loading = useSelector(selectLoadingBudgets);

  useEffect(() => {
    dispatch(requestBudgetsAction(null));
  }, []);

  return (
    <Page className={"budgets"} loading={loading} title={"Budgets"}>
      <div className={"dashboard-card-grid"}>
        <EmptyCard title={"New Budget"} icon={"plus"} onClick={() => setCreateBudgetModalOpen(true)} />
        {map(budgets, (budget: Model.Budget, index: number) => {
          return (
            <BudgetCard
              key={index}
              budget={budget}
              loading={includes(
                map(objLoading, (instance: Redux.ModelListActionInstance) => instance.id),
                budget.id
              )}
              onClick={() => history.push(`/budgets/${budget.id}`)}
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
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          allowTemplateSelection={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.Budget) => {
            setCreateBudgetModalOpen(false);
            dispatch(addBudgetToStateAction(budget));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </Page>
  );
};

export default Budgets;
