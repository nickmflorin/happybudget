import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Dispatch } from "redux";
import { includes, map, isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-light-svg-icons";

import { Input } from "components/fields";
import { Page } from "components/layout";
import { EditBudgetModal, CreateBudgetModal } from "components/modals";

import {
  requestBudgetsAction,
  deleteBudgetAction,
  updateBudgetInStateAction,
  addBudgetToStateAction,
  setBudgetsSearchAction
} from "../../store/actions";
import { EmptyCard, BudgetCard } from "../Card";

const selectBudgets = (state: Modules.ApplicationStore) => state.dashboard.budgets.data;
const selectLoadingBudgets = (state: Modules.ApplicationStore) => state.dashboard.budgets.loading;
const selectBudgetsSearch = (state: Modules.ApplicationStore) => state.dashboard.budgets.search;
const selectDeletingBudgets = (state: Modules.ApplicationStore) => state.dashboard.budgets.deleting;

const Budgets = (): JSX.Element => {
  const [budgetToEdit, setBudgetToEdit] = useState<Model.Budget | undefined>(undefined);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const history = useHistory();

  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const deleting = useSelector(selectDeletingBudgets);
  const loading = useSelector(selectLoadingBudgets);
  const search = useSelector(selectBudgetsSearch);

  useEffect(() => {
    dispatch(requestBudgetsAction(null));
  }, []);

  return (
    <Page
      className={"budgets"}
      loading={loading}
      title={"My Budgets"}
      extra={[
        <Input
          placeholder={"Search Projects..."}
          value={search}
          allowClear={true}
          prefix={<FontAwesomeIcon className={"icon"} icon={faSearch} />}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            dispatch(setBudgetsSearchAction(event.target.value))
          }
        />
      ]}
    >
      <div className={"dashboard-card-grid"}>
        <EmptyCard title={"New Budget"} icon={"plus"} onClick={() => setCreateBudgetModalOpen(true)} />
        {map(budgets, (budget: Model.Budget, index: number) => {
          return (
            <BudgetCard
              key={index}
              budget={budget}
              deleting={includes(
                map(deleting, (instance: Redux.ModelListActionInstance) => instance.id),
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
