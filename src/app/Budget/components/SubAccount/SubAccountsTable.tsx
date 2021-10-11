import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { redux, tabling, model, budgeting } from "lib";
import { CreateMarkupModal, EditMarkupModal } from "components/modals";
import { connectTableToStore } from "components/tabling";

import { actions } from "../../store";
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
        estimated: !isNil(budget) ? model.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? model.businessLogic.varianceValue(budget) : 0.0,
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
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? model.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? model.businessLogic.varianceValue(detail) : 0.0,
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
  const [markupSubAccounts, setMarkupSubAccounts] = useState<number[] | undefined>(undefined);
  const [markupToEdit, setMarkupToEdit] = useState<number | null>(null);

  const dispatch = useDispatch();
  const history = useHistory();

  const fringes = useSelector(selectFringes);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = budgeting.hooks.useGrouping({
    parentId: subaccountId,
    parentType: "subaccount",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      dispatch(
        actions.account.handleTableChangeEventAction({
          type: "groupUpdated",
          payload: { id: group.id, data: group }
        })
      )
  });

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"subaccount-subaccounts-table"}
        budget={budget}
        budgetId={budgetId}
        table={table}
        fringes={
          filter(fringes, (f: Table.BodyRow<Tables.FringeRowData>) =>
            tabling.typeguards.isModelRow(f)
          ) as Tables.FringeRow[]
        }
        subAccountUnits={subAccountUnits}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        rowCanExpand={false}
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
        onGroupRows={(rows: Table.ModelRow<R>[]) => onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id))}
        onMarkupRows={(rows: Table.ModelRow<R>[]) =>
          setMarkupSubAccounts(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => setMarkupToEdit(tabling.rows.markupId(row.id))}
      />
      {groupModals}
      {!isNil(markupSubAccounts) && !isNil(subaccountId) && (
        <CreateMarkupModal<
          Model.SimpleSubAccount,
          Model.Budget,
          Http.BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, Model.Budget>
        >
          id={subaccountId}
          parentType={"subaccount"}
          children={markupSubAccounts}
          open={true}
          onSuccess={(
            response: Http.BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, Model.Budget>
          ) => {
            setMarkupSubAccounts(undefined);
            table.current.applyTableChange({
              type: "markupAdded",
              payload: response.data
            });
            dispatch(actions.subAccount.updateInStateAction({ id: response.parent.id, data: response.parent }));
            dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
          }}
          onCancel={() => setMarkupSubAccounts(undefined)}
        />
      )}
      {!isNil(markupToEdit) && (
        <EditMarkupModal<
          Model.SimpleSubAccount,
          Model.Budget,
          Http.BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, Model.Budget>
        >
          id={markupToEdit}
          parentId={subaccountId}
          parentType={"subaccount"}
          open={true}
          onCancel={() => setMarkupToEdit(null)}
          onSuccess={(
            response: Http.BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, Model.Budget>
          ) => {
            setMarkupToEdit(null);
            table.current.applyTableChange({
              type: "markupUpdated",
              payload: { id: response.data.id, data: response.data }
            });
            dispatch(actions.subAccount.updateInStateAction({ id: response.parent.id, data: response.parent }));
            dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
          }}
        />
      )}
      <FringesModal budget={budget} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
