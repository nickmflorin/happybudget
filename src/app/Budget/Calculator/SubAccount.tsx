import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef, ColSpanParams } from "ag-grid-community";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { GenericBudgetTable } from "components/tables";
import { formatCurrency } from "util/string";

import CommentsHistoryDrawer from "../CommentsHistoryDrawer";

import {
  setSubAccountIdAction,
  setSubAccountSubAccountsSearchAction,
  selectSubAccountSubAccountsTableRowAction,
  addSubAccountSubAccountsTablePlaceholdersAction,
  deselectSubAccountSubAccountsTableRowAction,
  removeSubAccountSubAccountAction,
  updateSubAccountSubAccountAction,
  selectAllSubAccountSubAccountsTableRowsAction,
  requestSubAccountCommentsAction,
  submitSubAccountCommentAction,
  deleteSubAccountCommentAction,
  editSubAccountCommentAction,
  replyToSubAccountCommentAction
} from "./actions";

const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ budgetId: string; subaccountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const subAccountStore = useSelector((state: Redux.IApplicationStore) => state.calculator.subaccount);
  const budgetId = useSelector((state: Redux.IApplicationStore) => state.budget.budget.id);
  const commentsHistoryDrawerOpen = useSelector(
    (state: Redux.IApplicationStore) => state.budget.commentsHistoryDrawerOpen
  );
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.subaccount.comments);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <RenderWithSpinner loading={subAccountStore.subaccounts.table.loading}>
        <GenericBudgetTable<Table.SubAccountRowField, Table.IBudgetRowMeta, Table.ISubAccountRow>
          table={subAccountStore.subaccounts.table.data}
          isCellEditable={(row: Table.ISubAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "unit"], colDef.field)) {
              return false;
            } else if (includes(["identifier", "description", "name"], colDef.field)) {
              return true;
            } else {
              return row.meta.subaccounts.length === 0;
            }
          }}
          highlightNonEditableCell={(row: Table.ISubAccountRow, colDef: ColDef) => {
            return !includes(["quantity", "multiplier", "rate", "unit"], colDef.field);
          }}
          search={subAccountStore.subaccounts.table.search}
          onSearch={(value: string) => dispatch(setSubAccountSubAccountsSearchAction(value))}
          saving={
            subAccountStore.subaccounts.deleting.length !== 0 ||
            subAccountStore.subaccounts.updating.length !== 0 ||
            subAccountStore.subaccounts.creating
          }
          rowRefreshRequired={(existing: Table.ISubAccountRow, row: Table.ISubAccountRow) => existing.unit !== row.unit}
          onRowAdd={() => dispatch(addSubAccountSubAccountsTablePlaceholdersAction())}
          onRowSelect={(id: number) => dispatch(selectSubAccountSubAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectSubAccountSubAccountsTableRowAction(id))}
          onRowDelete={(row: Table.ISubAccountRow) => dispatch(removeSubAccountSubAccountAction(row))}
          onRowUpdate={(id: number, data: { [key: string]: any }) =>
            dispatch(updateSubAccountSubAccountAction({ id, data }))
          }
          onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
          onSelectAll={() => dispatch(selectAllSubAccountSubAccountsTableRowsAction())}
          estimated={
            !isNil(subAccountStore.detail.data) && !isNil(subAccountStore.detail.data.estimated)
              ? subAccountStore.detail.data.estimated
              : 0.0
          }
          columns={[
            {
              field: "identifier",
              headerName: "Line"
            },
            {
              field: "description",
              headerName: "Category Description",
              colSpan: (params: ColSpanParams) =>
                !isNil(params.data.meta) && params.data.meta.subaccounts.length !== 0 ? 5 : 1
            },
            {
              field: "name",
              headerName: "Name"
            },
            {
              field: "quantity",
              headerName: "Quantity",
              cellStyle: { textAlign: "right" }
            },
            {
              field: "unit",
              headerName: "Unit",
              cellStyle: { textAlign: "right" },
              cellRenderer: "UnitCell",
              cellRendererParams: {
                onChange: (unit: Unit, row: Table.ISubAccountRow) =>
                  dispatch(updateSubAccountSubAccountAction({ id: row.id, data: { unit } }))
              }
            },
            {
              field: "multiplier",
              headerName: "X",
              cellStyle: { textAlign: "right" }
            },
            {
              field: "rate",
              headerName: "Rate",
              cellStyle: { textAlign: "right" }
            },
            {
              field: "estimated",
              headerName: "Estimated",
              cellStyle: { textAlign: "right" },
              cellRendererParams: { formatter: formatCurrency }
            },
            {
              field: "actual",
              headerName: "Actual",
              cellStyle: { textAlign: "right" },
              cellRendererParams: { formatter: formatCurrency }
            },
            {
              field: "variance",
              headerName: "Variance",
              cellStyle: { textAlign: "right" },
              cellRendererParams: { formatter: formatCurrency }
            }
          ]}
        />
      </RenderWithSpinner>
      <CommentsHistoryDrawer
        visible={commentsHistoryDrawerOpen}
        commentsProps={{
          comments: comments.data,
          loading: comments.loading,
          submitting: comments.submitting,
          commentLoading: (comment: IComment) =>
            includes(comments.deleting, comment.id) ||
            includes(comments.editing, comment.id) ||
            includes(comments.replying, comment.id),
          onRequest: () => dispatch(requestSubAccountCommentsAction()),
          onSubmit: (payload: Http.ICommentPayload) => dispatch(submitSubAccountCommentAction(payload)),
          onDoneEditing: (comment: IComment, value: string) =>
            dispatch(editSubAccountCommentAction({ id: comment.id, data: { text: value } })),
          onDoneReplying: (comment: IComment, value: string) =>
            dispatch(replyToSubAccountCommentAction({ id: comment.id, data: { text: value } })),
          onLike: (comment: IComment) => console.log(comment),
          onDislike: (comment: IComment) => console.log(comment),
          onDelete: (comment: IComment) => dispatch(deleteSubAccountCommentAction(comment.id))
        }}
      />
    </RenderIfValidId>
  );
};

export default SubAccount;
