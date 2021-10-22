import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { map, isNil } from "lodash";

import * as api from "api";
import { redux } from "lib";

import { BudgetCard } from "components/cards";
import { NoBudgets } from "components/empty";
import { Page } from "components/layout";
import { EditBudgetModal, CreateBudgetModal } from "components/modals";
import { BudgetEmptyIcon } from "components/svgs";

import { actions } from "../../store";
import BudgetsSubTitle from "./BudgetsSubTitle";

const selectBudgets = (state: Application.Authenticated.Store) => state.dashboard.budgets.data;
const selectLoadingBudgets = (state: Application.Authenticated.Store) => state.dashboard.budgets.loading;

const Budgets = (): JSX.Element => {
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);
  const [isDuplicating, setDuplicating, setDuplicated] = redux.hooks.useTrackModelActions([]);

  const [budgetToEdit, setBudgetToEdit] = useState<number | null>(null);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);

  const history = useHistory();

  const dispatch: Redux.Dispatch = useDispatch();
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
      {budgets.length === 0 ? (
        <NoBudgets title={"You don't have any templates yet! Create a new budget."} subTitle>
          <BudgetEmptyIcon />
        </NoBudgets>
      ) : (
        <div className={"dashboard-card-grid"}>
          {map(budgets, (budget: Model.Budget, index: number) => {
            return (
              <BudgetCard
                key={index}
                budget={budget}
                deleting={isDeleting(budget.id)}
                duplicating={isDuplicating(budget.id)}
                onClick={() => history.push(`/budgets/${budget.id}`)}
                onEdit={() => setBudgetToEdit(budget.id)}
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
                onDuplicate={(e: MenuItemClickEvent<MenuItemModel>) => {
                  setDuplicating(budget.id);
                  api
                    .duplicateBudget(budget.id)
                    .then((response: Model.Budget) => {
                      e.closeParentDropdown?.();
                      dispatch(actions.addBudgetToStateAction(response));
                    })
                    .catch((err: Error) => api.handleRequestError(err))
                    .finally(() => setDuplicated(budget.id));
                }}
              />
            );
          })}
        </div>
      )}
      {!isNil(budgetToEdit) && (
        <EditBudgetModal
          open={true}
          id={budgetToEdit}
          onCancel={() => setBudgetToEdit(null)}
          onSuccess={(budget: Model.Budget) => {
            setBudgetToEdit(null);
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
