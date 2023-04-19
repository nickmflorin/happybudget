import { useEffect } from "react";

import { isNil } from "lodash";
import { useDispatch, useSelector } from "react-redux";

import { tabling, budgeting } from "lib";
import {
  connectTableToPublicStore,
  SubAccountsTable as GenericSubAccountsTable,
} from "deprecated/components/tabling";

import { useFringesModalControl } from "../hooks";
import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;
type TC = SubAccountsTableActionContext<Model.Budget, Model.Account, true>;

const ConnectedTable = connectTableToPublicStore<
  GenericSubAccountsTable.PublicBudgetProps<Model.Account>,
  R,
  M,
  TC,
  Tables.SubAccountTableStore
>({
  actions: {
    loading: actions.pub.account.loadingAction,
    response: actions.pub.account.responseAction,
    setSearch: actions.pub.account.setSearchAction,
  },
  tableId: (c: TC) => `public-${c.domain}-${c.parentType}-accounts`,
  selector: (c: TC) => selectors.createSubAccountsTableStoreSelector(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.pub.account.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    page: selectors.createBudgetFooterSelector(c),
    footer: selectors.createAccountFooterSelector({ ...c, id: c.parentId }),
  }),
})(GenericSubAccountsTable.PublicBudget);

interface AccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly tokenId: string;
  readonly budget: Model.Budget | null;
}

const Account = (props: AccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();
  const account = useSelector((s: Application.Store) =>
    selectors.selectAccountDetail(s, { id: props.id, domain: "budget", public: true }),
  );

  const [fringesModalVisible, openFringesModal, closeFringesModal] = useFringesModalControl<
    Model.Budget,
    Model.Account
  >({
    parentId: props.id,
    budgetId: props.budgetId,
    domain: "budget",
    parentType: "account",
    public: true,
    table: table.current,
  });

  useEffect(() => {
    dispatch(
      actions.pub.account.requestAccountAction(null, {
        id: props.id,
        domain: "budget",
        public: true,
        budgetId: props.budgetId,
      }),
    );
  }, [props.id]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(account)) {
      budgeting.urls.setLastVisited(props.budget, account, props.tokenId);
    }
  }, [props.budget, account]);

  useEffect(() => {
    dispatch(
      actions.pub.account.requestAction(null, {
        parentId: props.id,
        domain: "budget",
        public: true,
        parentType: "account",
        budgetId: props.budgetId,
      }),
    );
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage parent={account} {...props}>
      <ConnectedTable
        {...props}
        parent={account}
        tableContext={{
          parentId: props.id,
          budgetId: props.budgetId,
          parentType: "account",
          domain: "budget",
          public: true,
        }}
        onViewFringes={() => openFringesModal()}
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
