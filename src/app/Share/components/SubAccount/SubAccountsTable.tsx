import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { redux } from "lib";
import { hooks } from "store";
import { ReadOnlyBudgetSubAccountsTable } from "components/tabling";

import { actions } from "../../store";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.subaccount.table.groups.data
);
const selectSubAccounts = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.subaccount.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.subaccount.table.search
);
const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.subaccount.detail.data
);
const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.subaccount.table.fringes.data
);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const SubAccountsTable = ({ budget, budgetId, subaccountId }: SubAccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const data = useSelector(selectSubAccounts);
  const search = useSelector(selectTableSearch);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const groups = useSelector(selectGroups);
  const fringes = useSelector(selectFringes);
  const subAccountUnits = hooks.useSubAccountUnits();
  const contacts = hooks.useContacts();

  return (
    <ReadOnlyBudgetSubAccountsTable
      budget={budget}
      levelType={"subaccount"}
      models={data}
      groups={groups}
      detail={subaccountDetail}
      contacts={contacts}
      subAccountUnits={subAccountUnits}
      fringes={fringes}
      // Right now, the SubAccount recursion only goes 1 layer deep.
      // Account -> SubAccount -> Detail (Recrusive SubAccount).
      onRowExpand={null}
      tableFooterIdentifierValue={
        !isNil(subaccountDetail) && !isNil(subaccountDetail.description)
          ? `${subaccountDetail.description} Total`
          : "Sub Account Total"
      }
      exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
      search={search}
      onSearch={(value: string) => dispatch(actions.subAccount.setSubAccountsSearchAction(value))}
      categoryName={"Detail"}
      identifierFieldHeader={"Line"}
      onBack={(row?: Tables.FringeRow) => {
        if (!isNil(subaccountDetail) && !isNil(subaccountDetail.ancestors) && subaccountDetail.ancestors.length !== 0) {
          const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
          if (ancestor.type === "subaccount") {
            history.push(`/budgets/${budgetId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
          } else {
            history.push(`/budgets/${budgetId}/accounts/${ancestor.id}?row=${subaccountId}`);
          }
        }
      }}
      cookieNames={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
    />
  );
};

export default SubAccountsTable;
