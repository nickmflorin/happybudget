import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { redux, tabling } from "lib";
import { hooks } from "store";
import { ReadOnlyBudgetSubAccountsTable } from "components/tabling";

import { actions } from "../../store";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.account.table.groups.data
);
const selectData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.account.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.account.table.search
);
const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.account.detail.data
);
const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.account.table.fringes.data
);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const SubAccountsTable = ({ budget, budgetId, accountId }: SubAccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const accountDetail = useSelector(selectAccountDetail);
  const groups = useSelector(selectGroups);
  const subAccountUnits = hooks.useSubAccountUnits();
  const contacts = hooks.useContacts();
  const fringes = useSelector(selectFringes);

  const tableRef = tabling.hooks.useReadOnlyTable<Tables.SubAccountRow, Model.SubAccount>();

  return (
    <ReadOnlyBudgetSubAccountsTable
      budget={budget}
      tableRef={tableRef}
      levelType={"account"}
      models={data}
      groups={groups}
      detail={accountDetail}
      subAccountUnits={subAccountUnits}
      menuPortalId={"supplementary-header"}
      contacts={contacts}
      fringes={fringes}
      tableFooterIdentifierValue={
        !isNil(accountDetail) && !isNil(accountDetail.description)
          ? `${accountDetail.description} Total`
          : "Account Total"
      }
      exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
      search={search}
      onSearch={(value: string) => dispatch(actions.account.setSubAccountsSearchAction(value))}
      categoryName={"Sub Account"}
      identifierFieldHeader={"Account"}
      cookieNames={!isNil(accountDetail) ? { ordering: `account-${accountDetail.id}-table-ordering` } : {}}
      onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
      onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
    />
  );
};

export default SubAccountsTable;
