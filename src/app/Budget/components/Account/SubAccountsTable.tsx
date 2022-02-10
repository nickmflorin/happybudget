import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map, filter, findIndex } from "lodash";
import { createSelector } from "reselect";

import { redux, tabling, budgeting, util } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { connectTableToStore } from "tabling";

import { actions, selectors, sagas } from "../../store";
import BudgetSubAccountsTable, { BudgetSubAccountsTableProps } from "../SubAccountsTable";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.account.detail.data
);

const ConnectedTable = connectTableToStore<
  BudgetSubAccountsTableProps,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    tableChanged: actions.account.handleTableChangeEventAction,
    loading: actions.account.loadingAction,
    response: actions.account.responseAction,
    addModelsToState: actions.account.addModelsToStateAction,
    setSearch: actions.account.setSearchAction
  },
  selector: (s: Application.Store) => selectors.selectSubAccountsTableStore(s, "account"),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.account.createTableSaga(table),
  footerRowSelectors: {
    page: createSelector(
      (state: Application.AuthenticatedStore) => state.budget.detail.data,
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      (state: Application.AuthenticatedStore) => state.budget.account.detail.data,
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

  const account = useSelector(selectAccountDetail);
  const table = tabling.hooks.useTable<Tables.SubAccountRowData, Model.SubAccount>();

  useEffect(() => {
    dispatch(actions.account.requestAction(null, { id: accountId, budgetId }));
  }, [accountId, budgetId]);

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
        budget={budget}
        budgetId={budgetId}
        id={accountId}
        actionContext={{ budgetId, id: accountId }}
        tableId={"budget-account-subaccounts"}
        parentType={"account"}
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
                  ...(row.data.attachments || []),
                  { id: attachment.id, name: attachment.name, extension: attachment.extension, url: attachment.url }
                ]
              }
            })
          )
        }
        setPreviewModalVisible={setPreviewModalVisible}
        exportFileName={!isNil(account) ? `account_${account.identifier}` : ""}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        onRowExpand={(row: Table.ModelRow<R>) =>
          history.push(
            budgeting.urls.getUrl(
              { type: "budget", domain: "budget", id: budgetId },
              { type: "subaccount", id: row.id }
            )
          )
        }
        onBack={() =>
          history.push(
            util.urls.addQueryParamsToUrl(budgeting.urls.getUrl({ type: "budget", domain: "budget", id: budgetId }), {
              row: accountId
            })
          )
        }
        onLeft={() => {
          if (!isNil(account) && !isNil(account.table)) {
            const index = findIndex(account.table || [], (sib: Model.SimpleAccount) => sib.id === account.id);
            if (index !== -1 && account.table[index - 1] !== undefined) {
              history.push(
                budgeting.urls.getUrl(
                  { type: "budget", id: budgetId, domain: "budget" },
                  { type: "account", id: account.table[index - 1].id }
                )
              );
            }
          }
        }}
        onRight={() => {
          if (!isNil(account) && !isNil(account.table)) {
            const index = findIndex(account.table, (sib: Model.SimpleAccount) => sib.id === account.id);
            if (index !== -1 && account.table[index + 1] !== undefined) {
              history.push(
                budgeting.urls.getUrl(
                  { type: "budget", id: budgetId, domain: "budget" },
                  { type: "account", id: account.table[index + 1].id }
                )
              );
            }
          }
        }}
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
