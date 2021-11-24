import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, filter } from "lodash";

import { redux, budgeting, tabling } from "lib";
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

const ActionMap = {
  request: actions.subAccount.requestAction,
  loading: actions.subAccount.loadingAction,
  response: actions.subAccount.responseAction,
  setSearch: actions.subAccount.setSearchAction,
  clear: actions.subAccount.clearAction
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
  selector: redux.selectors.simpleDeepEqualSelector(
    (state: Application.Unauthenticated.Store) => state.share.subaccount.table
  ),
  footerRowSelectors: {
    page: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Unauthenticated.Store) => state.share.detail.data)],
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      [
        redux.selectors.simpleDeepEqualSelector(
          (state: Application.Unauthenticated.Store) => state.share.subaccount.detail.data
        )
      ],
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? budgeting.businessLogic.varianceValue(detail) : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(GenericSubAccountsTable.UnauthenticatedBudget);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const SubAccountsTable = ({ budget, budgetId, subaccountId }: SubAccountsTableProps): JSX.Element => {
  const history = useHistory();

  const subaccountDetail = useSelector(selectSubAccountDetail);
  const fringes = useSelector(selectFringes);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <ConnectedTable
      subAccountUnits={subAccountUnits}
      fringes={
        filter(fringes, (f: Table.BodyRow<Tables.FringeRowData>) =>
          tabling.typeguards.isModelRow(f)
        ) as Tables.FringeRow[]
      }
      // Right now, the SubAccount recursion only goes 1 layer deep.
      // Account -> SubAccount -> Detail (Recrusive SubAccount).
      rowCanExpand={false}
      exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
      categoryName={"Detail"}
      identifierFieldHeader={"Line"}
      onBack={(row?: Table.BodyRow<R>) => {
        if (!isNil(subaccountDetail) && !isNil(subaccountDetail.ancestors) && subaccountDetail.ancestors.length !== 0) {
          const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
          if (ancestor.type === "subaccount") {
            history.push(`/budgets/${budgetId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
          } else {
            history.push(`/budgets/${budgetId}/accounts/${ancestor.id}?row=${subaccountId}`);
          }
        }
      }}
    />
  );
};

export default SubAccountsTable;
