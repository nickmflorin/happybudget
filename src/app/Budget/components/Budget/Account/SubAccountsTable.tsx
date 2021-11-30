import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map, filter } from "lodash";
import { createSelector } from "reselect";

import { redux, tabling, budgeting } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { connectTableToStore } from "components/tabling";

import { actions, selectors } from "../../../store";
import BudgetSubAccountsTable, { BudgetSubAccountsTableProps } from "../SubAccountsTable";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.account.detail.data
);

const ConnectedTable = connectTableToStore<BudgetSubAccountsTableProps, R, M, Tables.SubAccountTableStore>({
  actions: {
    tableChanged: actions.account.handleTableChangeEventAction,
    loading: actions.account.loadingAction,
    response: actions.account.responseAction,
    saving: actions.account.savingTableAction,
    addModelsToState: actions.account.addModelsToStateAction,
    setSearch: actions.account.setSearchAction,
    clear: actions.account.clearAction
  },
  // We cannot autoRequest because we have to also request the new data when the dropdown breadcrumbs change.
  autoRequest: false,
  selector: selectors.selectSubAccountsTableStore,
  footerRowSelectors: {
    page: createSelector(
      redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.detail.data),
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      redux.selectors.simpleDeepEqualSelector(
        (state: Application.Authenticated.Store) => state.budget.account.detail.data
      ),
      (detail: Model.Account | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? budgeting.businessLogic.varianceValue(detail) : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(BudgetSubAccountsTable);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const SubAccountsTable = ({
  budget,
  budgetId,
  accountId,
  setPreviewModalVisible
}: SubAccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const accountDetail = useSelector(selectAccountDetail);
  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: accountId,
    parentType: "account",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      table.current.applyTableChange({
        type: "groupUpdated",
        payload: group
      })
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup({
    parentId: accountId,
    parentType: "account",
    table: table.current,
    onResponse: (response: Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account, Model.Budget>) => {
      dispatch(actions.account.updateInStateAction({ id: response.parent.id, data: response.parent }));
      dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
    }
  });

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"account-subaccounts-table"}
        budget={budget}
        budgetId={budgetId}
        table={table}
        onAttachmentRemoved={(row: Table.ModelRow<R>, id: number) =>
          dispatch(
            actions.account.updateRowsInStateAction({
              id: row.id,
              data: {
                attachments: filter(row.data.attachments, (a: Model.SimpleAttachment) => a.id !== id)
              }
            })
          )
        }
        onAttachmentAdded={(row: Table.ModelRow<R>, attachment: Model.Attachment) =>
          dispatch(
            actions.account.updateRowsInStateAction({
              id: row.id,
              data: {
                attachments: [
                  ...row.data.attachments,
                  { id: attachment.id, name: attachment.name, extension: attachment.extension, url: attachment.url }
                ]
              }
            })
          )
        }
        setPreviewModalVisible={setPreviewModalVisible}
        exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/budgets/${budgetId}/subaccounts/${row.id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: Table.ModelRow<R>[]) => onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id))}
        onMarkupRows={(rows?: Table.ModelRow<R>[]) =>
          rows === undefined ? onCreateMarkup() : onCreateMarkup(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => onEditMarkup(tabling.managers.markupId(row.id))}
      />
      {groupModals}
      {markupModals}
    </React.Fragment>
  );
};

export default SubAccountsTable;
