import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Dispatch } from "redux";
import { map, isNil } from "lodash";

import * as api from "api";
import { redux } from "lib";

import { BudgetCard } from "components/cards";
import { Page } from "components/layout";
import { EditBudgetModal, CreateBudgetModal } from "components/modals";

import { actions } from "../../store";
import BudgetsSubTitle from "./BudgetsSubTitle";

const selectBudgets = (state: Modules.ApplicationStore) => state.dashboard.budgets.data;
const selectLoadingBudgets = (state: Modules.ApplicationStore) => state.dashboard.budgets.loading;

const Budgets = (): JSX.Element => {
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);

  const [budgetToEdit, setBudgetToEdit] = useState<Model.Budget | undefined>(undefined);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const history = useHistory();

  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const loading = useSelector(selectLoadingBudgets);

  useEffect(() => {
    dispatch(actions.requestBudgetsAction(null));
  }, []);

  return (
    <Page
      className={"budgets"}
      loading={loading}
      title={"My Budgets"}
      subTitle={<BudgetsSubTitle onNewBudget={() => setCreateBudgetModalOpen(true)} />}
    >
      <div className={"dashboard-card-grid"}>
        {map(budgets, (budget: Model.Budget, index: number) => {
          return (
            <BudgetCard
              key={index}
              budget={budget}
              deleting={isDeleting(budget.id)}
              onClick={() => history.push(`/budgets/${budget.id}`)}
              onEdit={() => setBudgetToEdit(budget)}
              onDelete={(e: MenuItemClickEvent<MenuItemModel>) => {
                setDeleting(budget.id);
                api
                  .deleteBudget(budget.id)
                  .then(() => {
                    e.closeParentDropdown?.();
                    dispatch(actions.removeBudgetFromStateAction(budget.id));
                  })
                  .catch((err: Error) => api.handleRequestError(err))
                  .finally(() => setDeleted(budget.id));
              }}
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
            dispatch(actions.updateBudgetInStateAction({ id: budget.id, data: budget }));
          }}
        />
      )}
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.Budget) => {
            setCreateBudgetModalOpen(false);
            dispatch(actions.addBudgetToStateAction(budget));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </Page>
  );
};

export default Budgets;
