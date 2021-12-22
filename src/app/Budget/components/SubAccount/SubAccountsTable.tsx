import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { redux, tabling, budgeting } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { connectTableToStore } from "tabling";

import { actions, selectors, sagas } from "../../store";
import BudgetSubAccountsTable, { BudgetSubAccountsTableProps } from "../SubAccountsTable";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.subaccount.detail.data
);

const ConnectedTable = connectTableToStore<
  BudgetSubAccountsTableProps,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    tableChanged: actions.subAccount.handleTableChangeEventAction,
    loading: actions.subAccount.loadingAction,
    response: actions.subAccount.responseAction,
    saving: actions.subAccount.savingTableAction,
    addModelsToState: actions.subAccount.addModelsToStateAction,
    setSearch: actions.subAccount.setSearchAction
  },
  selector: selectors.selectSubAccountsTableStore,
  createSaga: (table: Table.TableInstance<R, M>) => sagas.subAccount.createTableSaga(table),
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
      (state: Application.AuthenticatedStore) => state.budget.subaccount.detail.data,
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? budgeting.businessLogic.varianceValue(detail) : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(BudgetSubAccountsTable);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const SubAccountsTable = ({
  budget,
  budgetId,
  subaccountId,
  setPreviewModalVisible
}: SubAccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const table = tabling.hooks.useTable<Tables.SubAccountRowData, Model.SubAccount>();

  useEffect(() => {
    dispatch(actions.subAccount.requestAction(null, { id: subaccountId, budgetId }));
  }, [subaccountId, budgetId]);

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: subaccountId,
    parentType: "subaccount",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      table.current.applyTableChange({
        type: "groupUpdated",
        payload: group
      })
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup({
    parentId: subaccountId,
    parentType: "subaccount",
    table: table.current,
    onResponse: (response: Http.BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, Model.Budget>) => {
      dispatch(actions.subAccount.updateInStateAction({ id: response.parent.id, data: response.parent }));
      dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
    }
  });

  return (
    <React.Fragment>
      <ConnectedTable
        budget={budget}
        budgetId={budgetId}
        id={subaccountId}
        actionContext={{ id: subaccountId, budgetId }}
        tableId={"budget-subaccount-subaccounts"}
        table={table}
        setPreviewModalVisible={setPreviewModalVisible}
        onAttachmentRemoved={(row: Table.ModelRow<R>, id: number) =>
          dispatch(
            actions.subAccount.updateRowsInStateAction({
              id: row.id,
              data: {
                attachments: filter(row.data.attachments, (a: Model.SimpleAttachment) => a.id !== id)
              }
            })
          )
        }
        onAttachmentAdded={(row: Table.ModelRow<R>, attachment: Model.Attachment) =>
          dispatch(
            actions.subAccount.updateRowsInStateAction({
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
        /* Right now, the SubAccount recursion only goes 1 layer deep.
           Account -> SubAccount -> Detail (Recrusive SubAccount). */
        hideEditColumn={true}
        exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onBack={() => {
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
