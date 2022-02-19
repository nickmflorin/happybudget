import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { budgeting, tabling } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToPublicStore } from "tabling";

import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ConnectedTable = connectTableToPublicStore<
  GenericAccountsTable.PublicBudgetProps,
  R,
  M,
  Tables.AccountTableStore,
  Tables.AccountTableContext
>({
  actions: {
    loading: actions.budget.accounts.loadingAction,
    response: actions.budget.accounts.responseAction,
    setSearch: actions.budget.accounts.setSearchAction
  },
  tableId: "public-budget-accounts",
  selector: (s: Application.Store) => selectors.selectAccountsTableStore(s, { domain: "budget", public: true }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.pub.accounts.createTableSaga(table),
  footerRowSelectors: {
    footer: createSelector(
      (state: Application.Store) => state.public.budget.detail.data,
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    )
  }
})(GenericAccountsTable.PublicBudget);

interface AccountsProps {
  readonly budgetId: number;
  readonly tokenId: string;
  readonly budget: Model.Budget | null;
}

const Accounts = (props: AccountsProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();

  useEffect(() => {
    if (!isNil(props.budget)) {
      budgeting.urls.setLastVisited(props.budget, undefined, props.tokenId);
    }
  }, [props.budget]);

  useEffect(() => {
    dispatch(actions.budget.accounts.requestAction(null, { budgetId: props.budgetId }));
  }, [props.budgetId]);

  return (
    <BudgetPage {...props}>
      <ConnectedTable
        id={props.budgetId}
        parent={props.budget}
        actionContext={{ budgetId: props.budgetId }}
        table={table}
        tokenId={props.tokenId}
      />
    </BudgetPage>
  );
};

export default Accounts;
