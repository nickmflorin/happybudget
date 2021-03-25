import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef, ColSpanParams } from "ag-grid-community";

import BudgetTable from "lib/BudgetTable";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { formatCurrencyWithoutDollarSign } from "util/string";
import { floatValueSetter, integerValueSetter } from "util/table";

import CommentsHistoryDrawer from "../../CommentsHistoryDrawer";

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
  requestSubAccountSubAccountsHistoryAction
} from "../actions";

const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ budgetId: string; subaccountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const subAccountStore = useSelector((state: Redux.IApplicationStore) => state.calculator.subaccount);
  const budgetId = useSelector((state: Redux.IApplicationStore) => state.budget.budget.id);
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.subaccount.comments);
  const events = useSelector((state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.history);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <RenderWithSpinner loading={subAccountStore.subaccounts.table.loading}>
        <BudgetTable<Table.SubAccountRow>
          identifierField={"identifier"}
          identifierFieldHeader={"Account"}
          table={subAccountStore.subaccounts.table.data}
          isCellEditable={(row: Table.SubAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "variance", "unit"], colDef.field)) {
              return false;
            } else if (includes(["identifier", "description", "name"], colDef.field)) {
              return true;
            } else {
              return row.meta.children.length === 0;
            }
          }}
          highlightNonEditableCell={(row: Table.SubAccountRow, colDef: ColDef) => {
            return !includes(["quantity", "multiplier", "rate", "unit"], colDef.field);
          }}
          search={subAccountStore.subaccounts.table.search}
          onSearch={(value: string) => dispatch(setSubAccountSubAccountsSearchAction(value))}
          saving={
            subAccountStore.subaccounts.deleting.length !== 0 ||
            subAccountStore.subaccounts.updating.length !== 0 ||
            subAccountStore.subaccounts.creating
          }
          rowRefreshRequired={(existing: Table.SubAccountRow, row: Table.SubAccountRow) => existing.unit !== row.unit}
          onRowAdd={() => dispatch(addSubAccountSubAccountsTablePlaceholdersAction(1))}
          onRowSelect={(id: number) => dispatch(selectSubAccountSubAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectSubAccountSubAccountsTableRowAction(id))}
          onRowDelete={(row: Table.SubAccountRow) => dispatch(removeSubAccountSubAccountAction(row.id))}
          onRowUpdate={(payload: Table.RowChange) => dispatch(updateSubAccountSubAccountAction(payload))}
          onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
          onSelectAll={() => dispatch(selectAllSubAccountSubAccountsTableRowsAction())}
          totals={{
            estimated:
              !isNil(subAccountStore.detail.data) && !isNil(subAccountStore.detail.data.estimated)
                ? subAccountStore.detail.data.estimated
                : 0.0,
            variance:
              !isNil(subAccountStore.detail.data) && !isNil(subAccountStore.detail.data.variance)
                ? subAccountStore.detail.data.variance
                : 0.0,
            actual:
              !isNil(subAccountStore.detail.data) && !isNil(subAccountStore.detail.data.actual)
                ? subAccountStore.detail.data.actual
                : 0.0
          }}
          bodyColumns={[
            {
              field: "description",
              headerName: "Category Description",
              flex: 100,
              colSpan: (params: ColSpanParams) => {
                const row: Table.SubAccountRow = params.data;
                // Not totally sure why this conditional is necessary, but it's necessity might
                // be a symptom of another problem.  We should investigate.
                if (
                  !isNil(params.node) &&
                  params.node.group === false &&
                  !isNil(params.node) &&
                  params.node.group === false
                ) {
                  return row.meta.children.length !== 0 ? 5 : 1;
                }
                return 1;
              }
            },
            {
              field: "name",
              headerName: "Name",
              width: 15
            },
            {
              field: "quantity",
              headerName: "Quantity",
              width: 10,
              cellStyle: { textAlign: "right" },
              valueSetter: integerValueSetter("quantity")
            },
            {
              field: "unit",
              headerName: "Unit",
              cellClass: "cell--centered",
              cellRenderer: "UnitCell",
              width: 20,
              cellRendererParams: {
                onChange: (unit: Unit, row: Table.SubAccountRow) =>
                  dispatch(
                    updateSubAccountSubAccountAction({
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
              width: 10,
              cellStyle: { textAlign: "right" },
              valueSetter: floatValueSetter("multiplier")
            },
            {
              field: "rate",
              headerName: "Rate",
              width: 10,
              cellStyle: { textAlign: "right" },
              valueSetter: floatValueSetter("rate")
            }
          ]}
          calculatedColumns={[
            {
              field: "estimated",
              headerName: "Estimated",
              cellStyle: { textAlign: "right" },
              cellRendererParams: { formatter: formatCurrencyWithoutDollarSign }
            },
            {
              field: "actual",
              headerName: "Actual",
              cellStyle: { textAlign: "right" },
              cellRendererParams: { formatter: formatCurrencyWithoutDollarSign }
            },
            {
              field: "variance",
              headerName: "Variance",
              cellStyle: { textAlign: "right" },
              cellRendererParams: { formatter: formatCurrencyWithoutDollarSign, renderRedIfNegative: true }
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
          onRequest: () => dispatch(requestSubAccountCommentsAction()),
          onSubmit: (payload: Http.ICommentPayload) => dispatch(submitSubAccountCommentAction({ data: payload })),
          onDoneEditing: (comment: IComment, value: string) =>
            dispatch(editSubAccountCommentAction({ id: comment.id, data: { text: value } })),
          onDoneReplying: (comment: IComment, value: string) =>
            dispatch(submitSubAccountCommentAction({ parent: comment.id, data: { text: value } })),
          onLike: (comment: IComment) => console.log(comment),
          onDelete: (comment: IComment) => dispatch(deleteSubAccountCommentAction(comment.id))
        }}
        historyProps={{
          history: events.data,
          loading: events.loading,
          onRequest: () => dispatch(requestSubAccountSubAccountsHistoryAction())
        }}
      />
    </RenderIfValidId>
  );
};

export default SubAccount;
