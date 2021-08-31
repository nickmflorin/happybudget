import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { redux, tabling } from "lib";
import { SubAccountsTable as GenericSubAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.account.detail.data
);

const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.account.table.fringes.data
);

const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.account.table.subaccountUnits
);

const SubAccountsTableStoreSelector = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.account.table
);

const ActionMap = {
  request: actions.account.requestAction,
  loading: actions.account.loadingAction,
  response: actions.account.responseAction,
  setSearch: actions.account.setSearchAction
};

const ConnectedTable = connectTableToStore<
  GenericSubAccountsTable.UnauthenticatedBudgetProps,
  R,
  M,
  Model.BudgetGroup,
  Tables.SubAccountTableStore
>({
  actions: ActionMap,
  selector: SubAccountsTableStoreSelector
})(GenericSubAccountsTable.UnauthenticatedBudget);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const SubAccountsTable = ({ budget, budgetId, accountId }: SubAccountsTableProps): JSX.Element => {
  const history = useHistory();

  const fringes = useSelector(selectFringes);
  const accountDetail = useSelector(selectAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const tableRef = tabling.hooks.useAuthenticatedTable<R>();

  return (
    <ConnectedTable
      budget={budget}
      tableRef={tableRef}
      detail={accountDetail}
      fringes={fringes}
      subAccountUnits={subAccountUnits}
      tableFooterIdentifierValue={
        !isNil(accountDetail) && !isNil(accountDetail.description)
          ? `${accountDetail.description} Total`
          : "Account Total"
      }
      exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
      categoryName={"Sub Account"}
      identifierFieldHeader={"Account"}
      cookieNames={!isNil(accountDetail) ? { ordering: `account-${accountDetail.id}-table-ordering` } : {}}
      onRowExpand={(row: Table.ModelRow<R>) => history.push(`/budgets/${budgetId}/subaccounts/${row.id}`)}
      onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
    />
  );
};

export default SubAccountsTable;
