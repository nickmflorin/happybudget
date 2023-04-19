import { useEffect } from "react";

import { isNil } from "lodash";
import { useDispatch, useSelector } from "react-redux";

import { tabling, budgeting } from "lib";
import {
  connectTableToAuthenticatedStore,
  SubAccountsTable as GenericSubAccountsTable,
} from "deprecated/components/tabling";

import { useFringesModalControl } from "../hooks";
import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;
type TC = SubAccountsTableContext<Model.Template, Model.SubAccount, false>;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericSubAccountsTable.AuthenticatedTemplateProps<Model.SubAccount>,
  R,
  M,
  TC,
  Tables.SubAccountTableStore
>({
  actions: {
    handleEvent: actions.template.subAccount.handleTableEventAction,
    loading: actions.template.subAccount.loadingAction,
    response: actions.template.subAccount.responseAction,
    setSearch: actions.template.subAccount.setSearchAction,
  },
  tableId: (c: TC) => `${c.domain}-${c.parentType}-subaccounts`,
  selector: (c: TC) => selectors.createSubAccountsTableStoreSelector(c),
  createSaga: (table: Table.TableInstance<R, M>) =>
    sagas.template.subAccount.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    page: selectors.createBudgetFooterSelector(c),
    footer: selectors.createSubAccountFooterSelector({ ...c, id: c.parentId }),
  }),
})(GenericSubAccountsTable.AuthenticatedTemplate);

interface SubAccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const SubAccount = (props: SubAccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const [fringesModalVisible, openFringesModal, closeFringesModal] = useFringesModalControl<
    Model.Template,
    Model.SubAccount
  >({
    parentId: props.id,
    budgetId: props.budgetId,
    domain: "template",
    parentType: "subaccount",
    public: false,
    table: table.current,
    tableEventAction: actions.template.subAccount.handleTableEventAction,
    fringesTableEventAction: actions.template.handleFringesTableEventAction,
  });

  const subaccount = useSelector((s: Application.Store) =>
    selectors.selectSubAccountDetail(s, {
      id: props.id,
      domain: "template",
      public: false,
    }),
  );

  useEffect(() => {
    dispatch(
      actions.template.subAccount.requestSubAccountAction(null, {
        id: props.id,
        domain: "template",
        public: false,
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
      actions.template.subAccount.requestAction(null, {
        domain: "template",
        parentType: "subaccount",
        budgetId: props.budgetId,
        public: false,
        parentId: props.id,
      }),
    );
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage parent={subaccount} budget={props.budget}>
      <ConnectedTable
        {...props}
        parent={subaccount}
        tableContext={{
          parentId: props.id,
          budgetId: props.budgetId,
          parentType: "subaccount",
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
        parentType="subaccount"
        onCancel={() => closeFringesModal()}
      />
    </BudgetPage>
  );
};

export default SubAccount;
