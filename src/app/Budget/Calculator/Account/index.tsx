import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef, ColSpanParams } from "ag-grid-community";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { GenericBudgetTable } from "components/tables";
import { formatCurrency } from "util/string";
import { floatValueSetter, integerValueSetter } from "util/table";

import CommentsHistoryDrawer from "../../CommentsHistoryDrawer";

import {
  setAccountIdAction,
  addAccountSubAccountsTablePlaceholdersAction,
  deselectAccountSubAccountsTableRowAction,
  removeAccountSubAccountAction,
  selectAccountSubAccountsTableRowAction,
  setAccountSubAccountsSearchAction,
  updateAccountSubAccountAction,
  selectAllAccountSubAccountsTableRowsAction,
  requestAccountCommentsAction,
  submitAccountCommentAction,
  deleteAccountCommentAction,
  editAccountCommentAction,
  requestAccountSubAccountsHistoryAction
} from "../actions";

const Account = (): JSX.Element => {
  const { accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const accountStore = useSelector((state: Redux.IApplicationStore) => state.calculator.account);
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.account.comments);
  const events = useSelector((state: Redux.IApplicationStore) => state.calculator.account.subaccounts.history);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <RenderWithSpinner loading={accountStore.subaccounts.table.loading || accountStore.detail.loading}>
        <GenericBudgetTable<Table.SubAccountRowField, Table.IBudgetRowMeta, Table.ISubAccountRow>
          table={accountStore.subaccounts.table.data}
          isCellEditable={(row: Table.ISubAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "unit", "variance"], colDef.field)) {
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
          search={accountStore.subaccounts.table.search}
          onSearch={(value: string) => dispatch(setAccountSubAccountsSearchAction(value))}
          saving={
            accountStore.subaccounts.deleting.length !== 0 ||
            accountStore.subaccounts.updating.length !== 0 ||
            accountStore.subaccounts.creating
          }
          rowRefreshRequired={(existing: Table.ISubAccountRow, row: Table.ISubAccountRow) => existing.unit !== row.unit}
          onRowAdd={() => dispatch(addAccountSubAccountsTablePlaceholdersAction(1))}
          onRowSelect={(id: number) => dispatch(selectAccountSubAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountSubAccountsTableRowAction(id))}
          onRowDelete={(row: Table.ISubAccountRow) => dispatch(removeAccountSubAccountAction(row.id))}
          onRowUpdate={(payload: Table.RowChange) => dispatch(updateAccountSubAccountAction(payload))}
          onRowExpand={(id: number) => history.push(`/budgets/${budget.id}/subaccounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountSubAccountsTableRowsAction())}
          footerRow={{
            identifier: "Grand Total",
            estimated:
              !isNil(accountStore.detail.data) && !isNil(accountStore.detail.data.estimated)
                ? accountStore.detail.data.estimated
                : 0.0,
            variance:
              !isNil(accountStore.detail.data) && !isNil(accountStore.detail.data.variance)
                ? accountStore.detail.data.variance
                : 0.0,
            actual:
              !isNil(accountStore.detail.data) && !isNil(accountStore.detail.data.actual)
                ? accountStore.detail.data.actual
                : 0.0
          }}
          columns={[
            {
              field: "identifier",
              headerName: "Line"
            },
            {
              field: "description",
              headerName: "Category Description",
              colSpan: (params: ColSpanParams) =>
                !isNil(params.data.meta) && params.data.meta.subaccounts.length !== 0 ? 6 : 1
            },
            {
              field: "name",
              headerName: "Name"
            },
            {
              field: "quantity",
              headerName: "Quantity",
              cellStyle: { textAlign: "right" },
              valueSetter: integerValueSetter("quantity")
            },
            {
              field: "unit",
              headerName: "Unit",
              cellClass: "cell--centered",
              cellRenderer: "UnitCell",
              cellRendererParams: {
                onChange: (unit: Unit, row: Table.ISubAccountRow) =>
                  dispatch(
                    updateAccountSubAccountAction({
                      id: row.id,
                      data: {
                        unit: {
                          oldValue: row.unit,
                          newValue: unit
                        }
                      }
                    })
                  )
              }
            },
            {
              field: "multiplier",
              headerName: "X",
              cellStyle: { textAlign: "right" },
              valueSetter: floatValueSetter("multiplier")
            },
            {
              field: "rate",
              headerName: "Rate",
              cellStyle: { textAlign: "right" },
              valueSetter: floatValueSetter("rate")
            },
            {
              field: "estimated",
              headerName: "Estimated",
              cellStyle: { textAlign: "right" }
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
              cellRendererParams: { formatter: formatCurrency, renderRedIfNegative: true }
            }
          ]}
        />
      </RenderWithSpinner>
      <CommentsHistoryDrawer
        commentsProps={{
          comments: comments.data,
          loading: comments.loading,
          submitting: comments.submitting,
          commentLoading: (comment: IComment) =>
            includes(comments.deleting, comment.id) ||
            includes(comments.editing, comment.id) ||
            includes(comments.replying, comment.id),
          onRequest: () => dispatch(requestAccountCommentsAction()),
          onSubmit: (payload: Http.ICommentPayload) => dispatch(submitAccountCommentAction({ data: payload })),
          onDoneEditing: (comment: IComment, value: string) =>
            dispatch(editAccountCommentAction({ id: comment.id, data: { text: value } })),
          onDoneReplying: (comment: IComment, value: string) =>
            dispatch(submitAccountCommentAction({ parent: comment.id, data: { text: value } })),
          onLike: (comment: IComment) => console.log(comment),
          onDelete: (comment: IComment) => dispatch(deleteAccountCommentAction(comment.id))
        }}
        historyProps={{
          history: events.data,
          loading: events.loading,
          onRequest: () => dispatch(requestAccountSubAccountsHistoryAction())
        }}
      />
    </RenderIfValidId>
  );
};

export default Account;
