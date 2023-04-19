import { useEffect } from "react";

import { isNil } from "lodash";
import { useDispatch, useSelector } from "react-redux";

import { budgeting, tabling } from "lib";
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
type TC = SubAccountsTableContext<Model.Budget, Model.SubAccount, true>;

const ConnectedTable = connectTableToPublicStore<
  GenericSubAccountsTable.PublicBudgetProps<Model.SubAccount>,
  R,
  M,
  TC,
  Tables.SubAccountTableStore
>({
  actions: {
    loading: actions.pub.subAccount.loadingAction,
    response: actions.pub.subAccount.responseAction,
    setSearch: actions.pub.subAccount.setSearchAction,
  },
  tableId: (c: TC) => `public-${c.domain}-${c.parentType}-subaccounts`,
  selector: (c: TC) => selectors.createSubAccountsTableStoreSelector(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.pub.subAccount.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    page: selectors.createBudgetFooterSelector(c),
    footer: selectors.createSubAccountFooterSelector({ ...c, id: c.parentId }),
  }),
})(GenericSubAccountsTable.PublicBudget);

interface SubAccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly tokenId: string;
  readonly budget: Model.Budget | null;
}

const SubAccount = (props: SubAccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const [fringesModalVisible, openFringesModal, closeFringesModal] = useFringesModalControl<
    Model.Budget,
    Model.SubAccount
  >({
    parentId: props.id,
    budgetId: props.budgetId,
    domain: "budget",
    parentType: "subaccount",
    public: true,
    table: table.current,
  });

  const subaccount = useSelector((s: Application.Store) =>
    selectors.selectSubAccountDetail(s, {
      id: props.id,
      domain: "budget",
      public: true,
    }),
  );

  useEffect(() => {
    dispatch(
      actions.pub.subAccount.requestSubAccountAction(null, {
        id: props.id,
        domain: "budget",
        public: true,
        budgetId: props.budgetId,
      }),
    );
  }, [props.id, props.budgetId]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(subaccount)) {
      budgeting.urls.setLastVisited(props.budget, subaccount);
    }
  }, [props.budget, subaccount]);

  useEffect(() => {
    dispatch(
      actions.pub.subAccount.requestAction(null, {
        domain: "budget",
        parentType: "subaccount",
        budgetId: props.budgetId,
        public: true,
        parentId: props.id,
      }),
    );
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage parent={subaccount} {...props}>
      <ConnectedTable
        {...props}
        parent={subaccount}
        tableContext={{
          parentId: props.id,
          budgetId: props.budgetId,
          parentType: "subaccount",
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
        parentType="subaccount"
        onCancel={() => closeFringesModal()}
      />
    </BudgetPage>
  );
};

export default SubAccount;
