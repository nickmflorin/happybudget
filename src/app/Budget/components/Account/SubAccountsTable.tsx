import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map, filter } from "lodash";
import { createSelector } from "reselect";

import { redux, tabling } from "lib";
import {
  CreateSubAccountGroupModal,
  EditGroupModal,
  EditMarkupModal,
  CreateBudgetSubAccountMarkupModal
} from "components/modals";
import { connectTableToStore } from "components/tabling";

import { actions } from "../../store";
import BudgetSubAccountsTable, { BudgetSubAccountsTableProps } from "../SubAccountsTable";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.account.detail.data
);

const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.account.table.fringes.data
);

const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.account.table.subaccountUnits
);

const ActionMap = {
  tableChanged: actions.account.handleTableChangeEventAction,
  loading: actions.account.loadingAction,
  response: actions.account.responseAction,
  saving: actions.account.savingTableAction,
  addModelsToState: actions.account.addModelsToStateAction,
  setSearch: actions.account.setSearchAction,
  clear: actions.account.clearAction
};

const ConnectedTable = connectTableToStore<BudgetSubAccountsTableProps, R, M, Tables.SubAccountTableStore>({
  actions: ActionMap,
  // We cannot autoRequest because we have to also request the new data when the dropdown breadcrumbs change.
  autoRequest: false,
  selector: redux.selectors.simpleDeepEqualSelector(
    (state: Application.Authenticated.Store) => state.budget.account.table
  ),
  footerRowSelectors: {
    page: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.detail.data)],
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budget.estimated + budget.markup_contribution + budget.fringe_contribution : 0.0,
        variance: !isNil(budget)
          ? budget.estimated + budget.markup_contribution + budget.fringe_contribution - budget.actual
          : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      [
        redux.selectors.simpleDeepEqualSelector(
          (state: Application.Authenticated.Store) => state.budget.account.detail.data
        )
      ],
      (detail: Model.Account | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? detail.estimated + detail.markup_contribution + detail.fringe_contribution : 0.0,
        variance: !isNil(detail)
          ? detail.estimated + detail.markup_contribution + detail.fringe_contribution - detail.actual
          : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(BudgetSubAccountsTable);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const SubAccountsTable = ({ budget, budgetId, accountId }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupMarkups, setGroupMarkups] = useState<number[] | undefined>(undefined);
  const [markupSubAccounts, setMarkupSubAccounts] = useState<number[] | undefined>(undefined);
  const [markupToEdit, setMarkupToEdit] = useState<number | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<Table.GroupRow<R> | undefined>(undefined);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const fringes = useSelector(selectFringes);
  const accountDetail = useSelector(selectAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const table = tabling.hooks.useTable<R, M>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"account-subaccounts-table"}
        budget={budget}
        budgetId={budgetId}
        table={table}
        fringes={fringes}
        subAccountUnits={subAccountUnits}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        onRowExpand={(row: Table.ModelRow<R, M>) => history.push(`/budgets/${budgetId}/subaccounts/${row.id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: (Table.ModelRow<R, M> | Table.MarkupRow<R>)[]) => {
          setGroupSubAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R, M> | Table.MarkupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R, M>[],
              (row: Table.ModelRow<R, M>) => row.id
            )
          );
          setGroupMarkups(
            map(
              filter(rows, (row: Table.ModelRow<R, M> | Table.MarkupRow<R>) =>
                tabling.typeguards.isMarkupRow(row)
              ) as Table.MarkupRow<R>[],
              (row: Table.MarkupRow<R>) => tabling.rows.markupId(row.id)
            )
          );
        }}
        onMarkupRows={(rows: (Table.ModelRow<R, M> | Table.GroupRow<R>)[]) =>
          setMarkupSubAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R, M> | Table.GroupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R, M>[],
              (row: Table.ModelRow<R, M>) => row.id
            )
          )
        }
        onEditGroup={(group: Table.GroupRow<R>) => setGroupToEdit(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => setMarkupToEdit(tabling.rows.markupId(row.id))}
      />
      {!isNil(markupSubAccounts) && !isNil(accountId) && (
        <CreateBudgetSubAccountMarkupModal
          accountId={accountId}
          subaccounts={markupSubAccounts}
          open={true}
          onSuccess={(markup: Model.Markup) => {
            setMarkupSubAccounts(undefined);
            dispatch(
              actions.accounts.handleTableChangeEventAction({
                type: "markupAdd",
                payload: markup
              })
            );
          }}
          onCancel={() => setMarkupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
          subaccounts={groupSubAccounts}
          markups={groupMarkups}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupSubAccounts(undefined);
            setGroupMarkups(undefined);
            dispatch(
              actions.account.handleTableChangeEventAction({
                type: "groupAdd",
                payload: group
              })
            );
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(markupToEdit) && (
        <EditMarkupModal
          id={markupToEdit}
          open={true}
          onCancel={() => setMarkupToEdit(null)}
          onSuccess={(markup: Model.Markup) => {
            setMarkupToEdit(null);
            dispatch(
              actions.account.handleTableChangeEventAction({
                type: "markupUpdate",
                payload: { id: markup.id, data: markup }
              })
            );
          }}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal
          id={tabling.rows.groupId(groupToEdit.id)}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            dispatch(
              actions.account.handleTableChangeEventAction({
                type: "groupUpdate",
                payload: { id: group.id, data: group }
              })
            );
            if (group.color !== groupToEdit.groupData.color) {
              table.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <FringesModal budget={budget} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
