import { useEffect } from "react";

import { isNil } from "lodash";
import { useDispatch, useSelector } from "react-redux";

import { tabling, budgeting } from "lib";
import {
  connectTableToAuthenticatedStore,
  SubAccountsTable as GenericSubAccountsTable,
} from "tabling";

import FringesModal from "./FringesModal";
import { useFringesModalControl } from "../hooks";
import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;
type TC = SubAccountsTableActionContext<Model.Template, Model.Account, false>;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericSubAccountsTable.AuthenticatedTemplateProps<Model.Account>,
  R,
  M,
  TC,
  Tables.SubAccountTableStore
>({
  actions: {
    handleEvent: actions.template.account.handleTableEventAction,
    loading: actions.template.account.loadingAction,
    response: actions.template.account.responseAction,
    setSearch: actions.template.account.setSearchAction,
  },
  tableId: (c: TC) => `${c.domain}-${c.parentType}-accounts`,
  selector: (c: TC) => selectors.createSubAccountsTableStoreSelector(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.template.account.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    page: selectors.createBudgetFooterSelector(c),
    footer: selectors.createAccountFooterSelector({ ...c, id: c.parentId }),
  }),
})(GenericSubAccountsTable.AuthenticatedTemplate);

interface AccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const Account = (props: AccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const [fringesModalVisible, openFringesModal, closeFringesModal] = useFringesModalControl<
    Model.Template,
    Model.Account
  >({
    parentId: props.id,
    budgetId: props.budgetId,
    domain: "template",
    parentType: "account",
    public: false,
    table: table.current,
    tableEventAction: actions.template.account.handleTableEventAction,
    fringesTableEventAction: actions.template.handleFringesTableEventAction,
  });

  const account = useSelector((s: Application.Store) =>
    selectors.selectAccountDetail(s, { id: props.id, domain: "template", public: false }),
  );

  useEffect(() => {
    dispatch(
      actions.template.account.requestAccountAction(null, {
        id: props.id,
        domain: "template",
        public: false,
        budgetId: props.budgetId,
      }),
    );
  }, [props.id, props.budgetId]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(account)) {
      budgeting.urls.setLastVisited(props.budget, account);
    }
  }, [props.budget, account]);

  useEffect(() => {
    dispatch(
      actions.template.account.requestAction(null, {
        parentId: props.id,
        budgetId: props.budgetId,
        parentType: "account",
        domain: "template",
        public: false,
      }),
    );
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage budget={props.budget} parent={account}>
      <ConnectedTable
        {...props}
        parent={account}
        tableContext={{
          parentId: props.id,
          budgetId: props.budgetId,
          parentType: "account",
          domain: "template",
          public: false,
        }}
        onViewFringes={openFringesModal}
        table={table}
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType="account"
        onCancel={() => closeFringesModal()}
      />
    </BudgetPage>
  );
};

export default Account;
