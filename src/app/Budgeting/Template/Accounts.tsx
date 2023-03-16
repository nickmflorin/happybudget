import { useEffect } from "react";

import { isNil } from "lodash";
import { useDispatch } from "react-redux";

import { budgeting, tabling } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToAuthenticatedStore } from "tabling";

import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

type R = Tables.AccountRowData;
type M = Model.Account;
type TC = BudgetActionContext<Model.Template, false>;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  TC,
  Tables.AccountTableStore
>({
  actions: {
    handleEvent: actions.template.handleTableEventAction,
    loading: actions.template.loadingAction,
    response: actions.template.responseAction,
    setSearch: actions.template.setSearchAction,
  },
  tableId: (c: TC) => `${c.domain}-accounts`,
  selector: (c: TC) => selectors.createAccountsTableStoreSelector<Model.Template, false>(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.template.accounts.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    footer: selectors.createBudgetFooterSelector(c),
  }),
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
    dispatch(
      actions.template.requestAction(null, {
        budgetId: props.budgetId,
        domain: "template",
        public: false,
      }),
    );
  }, [props.budgetId]);

  return (
    <BudgetPage budget={props.budget}>
      <ConnectedTable
        parent={props.budget}
        tableContext={{ budgetId: props.budgetId, domain: "template", public: false }}
        table={table}
      />
    </BudgetPage>
  );
};

export default Accounts;
