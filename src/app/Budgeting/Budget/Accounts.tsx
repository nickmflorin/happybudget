import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import { tabling, budgeting } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToAuthenticatedStore } from "tabling";

import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

type R = Tables.AccountRowData;
type M = Model.Account;
type TC = AccountsTableContext<Model.Budget, false>;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericAccountsTable.AuthenticatedBudgetProps,
  R,
  M,
  TC,
  Tables.AccountTableStore
>({
  actions: {
    handleEvent: actions.budget.handleTableEventAction,
    loading: actions.budget.loadingAction,
    response: actions.budget.responseAction,
    setSearch: actions.budget.setSearchAction
  },
  tableId: (c: TC) => `${c.domain}-accounts`,
  selector: (c: TC) => selectors.createAccountsTableStoreSelector<Model.Budget, false>(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.accounts.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    footer: selectors.createBudgetFooterSelector(c)
  })
})(GenericAccountsTable.AuthenticatedBudget);

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const Accounts = ({ setPreviewModalVisible, ...props }: AccountsProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();

  useEffect(() => {
    if (!isNil(props.budget)) {
      budgeting.urls.setLastVisited(props.budget);
    }
  }, [props.budget]);

  useEffect(() => {
    dispatch(actions.budget.requestAction(null, { budgetId: props.budgetId, domain: "budget", public: false }));
  }, [props.budgetId]);

  return (
    <BudgetPage budget={props.budget}>
      <ConnectedTable
        parent={props.budget}
        tableContext={{ budgetId: props.budgetId, domain: "budget", public: false }}
        table={table}
        onExportPdf={() => setPreviewModalVisible(true)}
        onShared={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } }, {})
          )
        }
        onShareUpdated={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } }, {})
          )
        }
        onUnshared={() =>
          dispatch(actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: null } }, {}))
        }
      />
    </BudgetPage>
  );
};

export default Accounts;
