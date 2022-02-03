import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";
import { createSelector } from "reselect";

import { tabling, budgeting } from "lib";
import { connectTableToPublicStore, SubAccountsTable as GenericSubAccountsTable } from "tabling";

import { actions, selectors, sagas } from "../../store";
import FringesModal from "../FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const ConnectedTable = connectTableToPublicStore<
  GenericSubAccountsTable.PublicBudgetProps<Model.SubAccount>,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    loading: actions.pub.subAccount.loadingAction,
    response: actions.pub.subAccount.responseAction,
    setSearch: actions.pub.subAccount.setSearchAction
  },
  tableId: "public-budget-subaccount-subaccounts-table",
  selector: (s: Application.Store) =>
    selectors.selectSubAccountsTableStore(s, { parentType: "subaccount", domain: "budget", public: true }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.pub.subAccount.createTableSaga(table),
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
      (state: Application.Store) => state.public.budget.subaccount.detail.data,
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? budgeting.businessLogic.varianceValue(detail) : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(GenericSubAccountsTable.PublicBudget);

interface SubAccountsTableProps {
  readonly id: number;
  readonly tokenId: string;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const SubAccountsTable = (props: SubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const dispatch = useDispatch();

  const subaccount = useSelector((s: Application.Store) =>
    selectors.selectSubAccountDetail(s, { domain: "budget", public: true })
  );
  const table = tabling.hooks.useTable<Tables.SubAccountRowData, Model.SubAccount>();

  useEffect(() => {
    dispatch(actions.pub.subAccount.requestAction(null, { id: props.id, budgetId: props.budgetId }));
  }, [props.id, props.budgetId]);

  return (
    <React.Fragment>
      <ConnectedTable
        {...props}
        parent={subaccount}
        actionContext={{ budgetId: props.budgetId, id: props.id }}
        parentType={"subaccount"}
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
    </React.Fragment>
  );
};

export default SubAccountsTable;
