import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { redux } from "lib";
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
  setSearch: actions.account.setSearchAction,
  clear: actions.account.clearAction
};

const ConnectedTable = connectTableToStore<
  GenericSubAccountsTable.UnauthenticatedBudgetProps,
  R,
  M,
  Tables.SubAccountTableStore
>({
  // We cannot autoRequest because we have to also request the new data when the dropdown breadcrumbs change.
  autoRequest: false,
  actions: ActionMap,
  selector: SubAccountsTableStoreSelector,
  footerRowSelectors: {
    page: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Unauthenticated.Store) => state.share.detail.data)],
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budget.estimated + budget.markup_contribution + budget.fringe_contribution : 0.0,
        variance: !isNil(budget)
          ? budget.estimated + budget.markup_contribution + budget.fringe_contribution - budget.actual
          : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      [
        redux.selectors.simpleDeepEqualSelector(
          (state: Application.Unauthenticated.Store) => state.share.account.detail.data
        )
      ],
      (detail: Model.Account | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? detail.estimated : 0.0,
        variance: !isNil(detail) ? detail.estimated - detail.actual : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(GenericSubAccountsTable.UnauthenticatedBudget);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const SubAccountsTable = ({ budget, budgetId, accountId }: SubAccountsTableProps): JSX.Element => {
  const history = useHistory();

  const fringes = useSelector(selectFringes);
  const accountDetail = useSelector(selectAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <ConnectedTable
      fringes={fringes}
      subAccountUnits={subAccountUnits}
      exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
      categoryName={"Sub Account"}
      identifierFieldHeader={"Account"}
      onRowExpand={(row: Table.ModelRow<R>) => history.push(`/budgets/${budgetId}/subaccounts/${row.id}`)}
      onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
    />
  );
};

export default SubAccountsTable;
