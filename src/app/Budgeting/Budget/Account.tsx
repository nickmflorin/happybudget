import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";
import { createSelector } from "reselect";

import { tabling, budgeting } from "lib";
import { connectTableToAuthenticatedStore, SubAccountsTable as GenericSubAccountsTable } from "tabling";

import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericSubAccountsTable.AuthenticatedBudgetProps<Model.Account>,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    tableChanged: actions.budget.account.handleTableEventAction,
    loading: actions.budget.account.loadingAction,
    response: actions.budget.account.responseAction,
    setSearch: actions.budget.account.setSearchAction
  },
  tableId: "budget-account-subaccounts-table",
  selector: (s: Application.Store) =>
    selectors.selectSubAccountsTableStore(s, { parentType: "account", domain: "budget" }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.account.createTableSaga(table),
  footerRowSelectors: {
    page: createSelector(
      (state: Application.Store) => state.budget.detail.data,
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      (state: Application.Store) => state.budget.account.detail.data,
      (detail: Model.Account | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? budgeting.businessLogic.varianceValue(detail) : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(GenericSubAccountsTable.AuthenticatedBudget);

interface AccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const Account = ({ setPreviewModalVisible, ...props }: AccountProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const dispatch = useDispatch();

  const account = useSelector((s: Application.Store) => selectors.selectAccountDetail(s, { domain: "budget" }));
  const table = tabling.hooks.useTable<Tables.SubAccountRowData, Model.SubAccount>();

  useEffect(() => {
    dispatch(actions.budget.account.requestAccountAction(props.id));
  }, [props.id]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(account)) {
      budgeting.urls.setLastVisited(props.budget, account);
    }
  }, [props.budget, account]);

  useEffect(() => {
    dispatch(actions.budget.account.requestAction(null, { id: props.id, budgetId: props.budgetId }));
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage budget={props.budget} parent={account}>
      <ConnectedTable
        {...props}
        parent={account}
        actionContext={{ budgetId: props.budgetId, id: props.id }}
        parentType={"account"}
        onExportPdf={() => setPreviewModalVisible(true)}
        onOpenFringesModal={() => setFringesModalVisible(true)}
        table={table}
        onParentUpdated={(p: Model.Account) =>
          dispatch(actions.budget.account.updateInStateAction({ id: p.id, data: p }))
        }
        onBudgetUpdated={(b: Model.Budget) => dispatch(actions.budget.updateBudgetInStateAction({ id: b.id, data: b }))}
        onShared={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } })
          )
        }
        onShareUpdated={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } })
          )
        }
        onUnshared={() =>
          dispatch(actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: null } }))
        }
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType={"account"}
        onCancel={() => setFringesModalVisible(false)}
      />
    </BudgetPage>
  );
};

export default Account;
