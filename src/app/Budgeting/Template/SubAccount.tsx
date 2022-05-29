import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";

import { tabling, budgeting } from "lib";
import { connectTableToAuthenticatedStore, SubAccountsTable as GenericSubAccountsTable } from "tabling";

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
    setSearch: actions.template.subAccount.setSearchAction
  },
  tableId: (c: TC) => `${c.domain}-${c.parentType}-subaccounts`,
  selector: (c: TC) => selectors.createSubAccountsTableStoreSelector(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.template.subAccount.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    page: selectors.createBudgetFooterSelector(c),
    footer: selectors.createSubAccountFooterSelector({ ...c, id: c.parentId })
  })
})(GenericSubAccountsTable.AuthenticatedTemplate);

interface SubAccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const SubAccount = (props: SubAccountProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const subaccount = useSelector((s: Application.Store) =>
    selectors.selectSubAccountDetail(s, {
      id: props.id,
      domain: "template",
      public: false
    })
  );

  useEffect(() => {
    dispatch(
      actions.template.subAccount.requestSubAccountAction(null, {
        id: props.id,
        domain: "template",
        public: false,
        budgetId: props.budgetId
      })
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
        parentId: props.id
      })
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
          public: false
        }}
        onOpenFringesModal={() => setFringesModalVisible(true)}
        table={table}
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType={"subaccount"}
        onCancel={() => setFringesModalVisible(false)}
      />
    </BudgetPage>
  );
};

export default SubAccount;
