import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { redux } from "lib";
import { SubAccountsTable as GenericSubAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.subaccount.detail.data
);

const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.subaccount.table.fringes.data
);

const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.subaccount.table.subaccountUnits
);

const SubAccountsTableStoreSelector = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.subaccount.table
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
  readonly subaccountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const SubAccountsTable = ({ budget, budgetId, subaccountId }: SubAccountsTableProps): JSX.Element => {
  const history = useHistory();

  const subaccountDetail = useSelector(selectSubAccountDetail);
  const fringes = useSelector(selectFringes);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <ConnectedTable
      budget={budget}
      detail={subaccountDetail}
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
      categoryName={"Detail"}
      identifierFieldHeader={"Line"}
      onBack={(row?: Tables.FringeRowData) => {
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
