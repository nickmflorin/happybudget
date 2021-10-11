import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map, filter } from "lodash";
import { createSelector } from "reselect";

import { redux, tabling, model, budgeting } from "lib";
import { EditMarkupModal, CreateMarkupModal } from "components/modals";
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
        estimated: !isNil(budget) ? model.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? model.businessLogic.varianceValue(budget) : 0.0,
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
        estimated: !isNil(detail) ? model.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? model.businessLogic.varianceValue(detail) : 0.0,
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
  const [markupSubAccounts, setMarkupSubAccounts] = useState<number[] | undefined>(undefined);
  const [markupToEdit, setMarkupToEdit] = useState<number | null>(null);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const fringes = useSelector(selectFringes);
  const accountDetail = useSelector(selectAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = budgeting.hooks.useGrouping({
    parentId: accountId,
    parentType: "account",
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
        tableId={"account-subaccounts-table"}
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
        exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/budgets/${budgetId}/subaccounts/${row.id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: Table.ModelRow<R>[]) => onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id))}
        onMarkupRows={(rows: Table.ModelRow<R>[]) =>
          setMarkupSubAccounts(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => setMarkupToEdit(tabling.rows.markupId(row.id))}
      />
      {groupModals}
      {!isNil(markupSubAccounts) && !isNil(accountId) && (
        <CreateMarkupModal<
          Model.SimpleSubAccount,
          Model.Budget,
          Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account, Model.Budget>
        >
          id={accountId}
          parentType={"account"}
          children={markupSubAccounts}
          open={true}
          onSuccess={(response: Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account, Model.Budget>) => {
            setMarkupSubAccounts(undefined);
            table.current.applyTableChange({
              type: "markupAdded",
              payload: response.data
            });
            dispatch(actions.account.updateInStateAction({ id: response.parent.id, data: response.parent }));
            dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
          }}
          onCancel={() => setMarkupSubAccounts(undefined)}
        />
      )}
      {!isNil(markupToEdit) && (
        <EditMarkupModal<
          Model.SimpleSubAccount,
          Model.Budget,
          Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account, Model.Budget>
        >
          id={markupToEdit}
          parentId={accountId}
          parentType={"account"}
          open={true}
          onCancel={() => setMarkupToEdit(null)}
          onSuccess={(response: Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account, Model.Budget>) => {
            setMarkupToEdit(null);
            table.current.applyTableChange({
              type: "markupUpdated",
              payload: { id: response.data.id, data: response.data }
            });
            dispatch(actions.account.updateInStateAction({ id: response.parent.id, data: response.parent }));
            dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
          }}
        />
      )}
      <FringesModal budget={budget} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
