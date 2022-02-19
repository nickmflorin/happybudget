import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";
import { createSelector } from "reselect";

import { tabling, budgeting } from "lib";
import { connectTableToPublicStore, SubAccountsTable as GenericSubAccountsTable } from "tabling";

import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const ConnectedTable = connectTableToPublicStore<
  GenericSubAccountsTable.PublicBudgetProps<Model.Account>,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    loading: actions.pub.account.loadingAction,
    response: actions.pub.account.responseAction,
    setSearch: actions.pub.account.setSearchAction
  },
  tableId: "public-budget-account-subaccounts-table",
  selector: (s: Application.Store) =>
    selectors.selectSubAccountsTableStore(s, { parentType: "account", domain: "budget" }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.pub.account.createTableSaga(table),
  footerRowSelectors: {
    page: createSelector(
      (state: Application.Store) => state.public.budget.detail.data,
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      (state: Application.Store) => state.public.budget.account.detail.data,
      (detail: Model.Account | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? budgeting.businessLogic.varianceValue(detail) : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(GenericSubAccountsTable.PublicBudget);

interface AccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly tokenId: string;
  readonly budget: Model.Budget | null;
}

const Account = (props: AccountProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const dispatch = useDispatch();

  const account = useSelector((s: Application.Store) =>
    selectors.selectAccountDetail(s, { domain: "budget", public: true })
  );
  const table = tabling.hooks.useTable<Tables.SubAccountRowData, Model.SubAccount>();

  useEffect(() => {
    dispatch(actions.budget.account.requestAccountAction(props.id));
  }, [props.id]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(account)) {
      budgeting.urls.setLastVisited(props.budget, account, props.tokenId);
    }
  }, [props.budget, account]);

  useEffect(() => {
    dispatch(actions.pub.account.requestAction(null, { id: props.id, budgetId: props.budgetId }));
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage parent={account} {...props}>
      <ConnectedTable
        {...props}
        parent={account}
        actionContext={{ budgetId: props.budgetId, id: props.id }}
        parentType={"account"}
        onOpenFringesModal={() => setFringesModalVisible(true)}
        table={table}
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType={"account"}
        onCancel={() => setFringesModalVisible(false)}
      />
    </BudgetPage>
  );
};

export default Account;
