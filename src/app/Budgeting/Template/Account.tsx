import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";
import { createSelector } from "reselect";

import { tabling, budgeting } from "lib";
import { connectTableToAuthenticatedStore, SubAccountsTable as GenericSubAccountsTable } from "tabling";

import { AccountPage } from "../Pages";
import { actions, selectors, sagas } from "../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericSubAccountsTable.AuthenticatedTemplateProps<Model.Account>,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    tableChanged: actions.template.account.handleTableChangeEventAction,
    loading: actions.template.account.loadingAction,
    response: actions.template.account.responseAction,
    addModelsToState: actions.template.account.addModelsToStateAction,
    setSearch: actions.template.account.setSearchAction
  },
  tableId: "template-account-subaccounts-table",
  selector: (s: Application.Store) =>
    selectors.selectSubAccountsTableStore(s, { parentType: "account", domain: "template" }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.template.account.createTableSaga(table),
  footerRowSelectors: {
    page: createSelector(
      (state: Application.Store) => state.template.detail.data,
      (budget: Model.Template | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0
      })
    ),
    footer: createSelector(
      (state: Application.Store) => state.template.account.detail.data,
      (detail: Model.Account | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0
      })
    )
  }
})(GenericSubAccountsTable.AuthenticatedTemplate);

interface AccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const Account = (props: AccountProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const dispatch = useDispatch();

  const account = useSelector((s: Application.Store) => selectors.selectAccountDetail(s, { domain: "template" }));
  const table = tabling.hooks.useTable<Tables.SubAccountRowData, Model.SubAccount>();

  useEffect(() => {
    dispatch(actions.template.account.requestAccountAction(props.id));
  }, [props.id]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(account)) {
      budgeting.urls.setLastVisited(props.budget, account);
    }
  }, [props.budget, account]);

  useEffect(() => {
    dispatch(actions.template.account.requestAction(null, { id: props.id, budgetId: props.budgetId }));
  }, [props.id, props.budgetId]);

  return (
    <AccountPage budget={props.budget} detail={account}>
      <ConnectedTable
        {...props}
        parent={account}
        actionContext={{ budgetId: props.budgetId, id: props.id }}
        parentType={"account"}
        onOpenFringesModal={() => setFringesModalVisible(true)}
        table={table}
        onParentUpdated={(p: Model.Account) =>
          dispatch(actions.template.account.updateInStateAction({ id: p.id, data: p }))
        }
        onBudgetUpdated={(b: Model.Template) =>
          dispatch(actions.template.updateBudgetInStateAction({ id: b.id, data: b }))
        }
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType={"account"}
        onCancel={() => setFringesModalVisible(false)}
      />
    </AccountPage>
  );
};

export default Account;
