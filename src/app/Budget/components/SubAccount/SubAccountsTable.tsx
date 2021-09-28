import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { redux, tabling } from "lib";
import {
  CreateSubAccountGroupModal,
  EditGroupModal,
  CreateBudgetSubAccountMarkupModal,
  EditMarkupModal
} from "components/modals";
import { connectTableToStore } from "components/tabling";

import { actions, selectors } from "../../store";
import BudgetSubAccountsTable, { BudgetSubAccountsTableProps } from "../SubAccountsTable";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.detail.data
);

const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.table.fringes.data
);

const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.table.subaccountUnits
);

const ActionMap = {
  tableChanged: actions.subAccount.handleTableChangeEventAction,
  loading: actions.subAccount.loadingAction,
  response: actions.subAccount.responseAction,
  saving: actions.subAccount.savingTableAction,
  addModelsToState: actions.subAccount.addModelsToStateAction,
  setSearch: actions.subAccount.setSearchAction,
  clear: actions.subAccount.clearAction
};

const ConnectedTable = connectTableToStore<BudgetSubAccountsTableProps, R, M, Tables.SubAccountTableStore>({
  actions: ActionMap,
  // We cannot autoRequest because we have to also request the new data when the dropdown breadcrumbs change.
  autoRequest: false,
  selector: redux.selectors.simpleDeepEqualSelector(
    (state: Application.Authenticated.Store) => state.budget.subaccount.table
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
          (state: Application.Authenticated.Store) => state.budget.subaccount.detail.data
        )
      ],
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Sub Account Total",
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
  readonly subaccountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const SubAccountsTable = ({ budget, budgetId, subaccountId }: SubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupMarkups, setGroupMarkups] = useState<number[] | undefined>(undefined);
  const [markupSubAccounts, setMarkupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Table.GroupRow<R> | undefined>(undefined);
  const [markupToEdit, setMarkupToEdit] = useState<number | null>(null);

  const dispatch = useDispatch();
  const history = useHistory();

  const fringes = useSelector(selectFringes);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const commentsHistoryDrawerOpen = useSelector(selectors.selectCommentsHistoryDrawerOpen);

  const table = tabling.hooks.useTable<R, M>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"subaccount-subaccounts-table"}
        budget={budget}
        budgetId={budgetId}
        table={table}
        fringes={fringes}
        subAccountUnits={subAccountUnits}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        onRowExpand={null}
        exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onBack={(row?: Tables.FringeRowData) => {
          if (
            !isNil(subaccountDetail) &&
            !isNil(subaccountDetail.ancestors) &&
            subaccountDetail.ancestors.length !== 0
          ) {
            const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
            if (ancestor.type === "subaccount") {
              history.push(`/budgets/${budgetId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
            } else {
              history.push(`/budgets/${budgetId}/accounts/${ancestor.id}?row=${subaccountId}`);
            }
          }
        }}
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
              (row: Table.MarkupRow<R>) => row.markup
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
        onEditMarkup={(row: Table.MarkupRow<R>) => setMarkupToEdit(row.markup)}
        actions={[
          {
            label: "Comments",
            icon: "comments-alt",
            onClick: () => dispatch(actions.setCommentsHistoryDrawerVisibilityAction(!commentsHistoryDrawerOpen))
          }
        ]}
      />
      {!isNil(markupSubAccounts) && !isNil(subaccountId) && (
        <CreateBudgetSubAccountMarkupModal
          subaccountId={subaccountId}
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
          subaccountId={subaccountId}
          subaccounts={groupSubAccounts}
          markups={groupMarkups}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupSubAccounts(undefined);
            setGroupMarkups(undefined);
            dispatch(
              actions.subAccount.handleTableChangeEventAction({
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
              actions.subAccount.handleTableChangeEventAction({
                type: "markupUpdate",
                payload: { id: markup.id, data: markup }
              })
            );
          }}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal
          id={groupToEdit.group}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            dispatch(
              actions.subAccount.handleTableChangeEventAction({
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
