import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { budgeting, tabling } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToAuthenticatedStore } from "tabling";

import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  Tables.AccountTableStore,
  Tables.AccountTableContext
>({
  actions: {
    tableChanged: actions.template.accounts.handleTableEventAction,
    loading: actions.template.accounts.loadingAction,
    response: actions.template.accounts.responseAction,
    setSearch: actions.template.accounts.setSearchAction
  },
  tableId: "template-accounts",
  selector: (s: Application.Store) => selectors.selectAccountsTableStore(s, { domain: "template" }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.template.accounts.createTableSaga(table),
  footerRowSelectors: {
    footer: createSelector(
      (state: Application.Store) => state.template.detail.data,
      (budget: Model.Template | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0
      })
    )
  }
})(GenericAccountsTable.AuthenticatedTemplate);

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const Accounts = (props: AccountsProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();

  useEffect(() => {
    if (!isNil(props.budget)) {
      budgeting.urls.setLastVisited(props.budget);
    }
  }, [props.budget]);

  useEffect(() => {
    dispatch(actions.template.accounts.requestAction(null, { budgetId: props.budgetId }));
  }, [props.budgetId]);

  return (
    <BudgetPage budget={props.budget}>
      <ConnectedTable
        id={props.budgetId}
        parent={props.budget}
        actionContext={{ budgetId: props.budgetId }}
        table={table}
        onParentUpdated={(p: Model.Template) =>
          dispatch(actions.template.updateBudgetInStateAction({ id: p.id, data: p }))
        }
      />
    </BudgetPage>
  );
};

export default Accounts;
