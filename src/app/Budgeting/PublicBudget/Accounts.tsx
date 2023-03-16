import { useEffect } from "react";

import { isNil } from "lodash";
import { useDispatch } from "react-redux";

import { budgeting, tabling } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToPublicStore } from "tabling";

import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

type R = Tables.AccountRowData;
type M = Model.Account;
type TC = AccountsTableContext<Model.Budget, true>;

const ConnectedTable = connectTableToPublicStore<
  GenericAccountsTable.PublicBudgetProps,
  R,
  M,
  TC,
  Tables.AccountTableStore
>({
  actions: {
    loading: actions.pub.loadingAction,
    response: actions.pub.responseAction,
    setSearch: actions.pub.setSearchAction,
  },
  tableId: (c: TC) => `pub-${c.domain}-accounts`,
  selector: (c: TC) => selectors.createAccountsTableStoreSelector<Model.Budget, true>(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.pub.accounts.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    footer: selectors.createBudgetFooterSelector(c),
  }),
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
    dispatch(
      actions.pub.requestAction(null, { budgetId: props.budgetId, domain: "budget", public: true }),
    );
  }, [props.budgetId]);

  return (
    <BudgetPage {...props}>
      <ConnectedTable
        tableContext={{ budgetId: props.budgetId, domain: "budget", public: true }}
        parent={props.budget}
        table={table}
        tokenId={props.tokenId}
      />
    </BudgetPage>
  );
};

export default Accounts;
