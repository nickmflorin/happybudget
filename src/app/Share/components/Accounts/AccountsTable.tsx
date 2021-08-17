import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { redux, tabling } from "lib";
import { ReadOnlyBudgetAccountsTable } from "components/tabling";

import { actions } from "../../store";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.budget.table.groups.data
);
const selectData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.budget.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.budget.table.search
);

interface AccountsTableProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const AccountsTable = ({ budgetId, budget }: AccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const groups = useSelector(selectGroups);

  return (
    <ReadOnlyBudgetAccountsTable
      models={data}
      groups={groups}
      search={search}
      budget={budget}
      menuPortalId={"supplementary-header"}
      onSearch={(value: string) => dispatch(actions.accounts.setAccountsSearchAction(value))}
      onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
    />
  );
};

export default AccountsTable;
