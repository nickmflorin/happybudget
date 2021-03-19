import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef } from "ag-grid-community";

import { WrapInApplicationSpinner } from "components/display";
import { GenericBudgetTable } from "components/tables";
import { formatCurrency } from "util/string";

import { setAncestorsAction } from "../../actions";
import CommentsHistoryDrawer from "../../CommentsHistoryDrawer";
import {
  requestAccountsAction,
  setAccountsSearchAction,
  addAccountsTablePlaceholdersAction,
  deselectAccountsTableRowAction,
  selectAccountsTableRowAction,
  removeAccountAction,
  updateAccountAction,
  selectAllAccountsTableRowsAction,
  submitBudgetCommentAction,
  requestBudgetCommentsAction,
  deleteBudgetCommentAction,
  editBudgetCommentAction,
  requestAccountsHistoryAction
} from "../actions";

const Accounts = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const accounts = useSelector((state: Redux.IApplicationStore) => state.calculator.accounts);
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.accounts.comments);
  const events = useSelector((state: Redux.IApplicationStore) => state.calculator.accounts.history);

  useEffect(() => {
    dispatch(requestAccountsAction());
  }, []);

  useEffect(() => {
    if (!isNil(budget.detail.data)) {
      dispatch(
        setAncestorsAction([
          {
            id: budget.detail.data.id,
            identifier: budget.detail.data.name,
            type: "budget"
          }
        ])
      );
    }
  }, [budget.detail.data]);

  return (
    <React.Fragment>
      <WrapInApplicationSpinner loading={budget.detail.loading || accounts.table.loading}>
        <GenericBudgetTable<Table.AccountRowField, Table.IBudgetRowMeta, Table.IAccountRow>
          table={accounts.table.data}
          isCellEditable={(row: Table.IAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "variance"], colDef.field)) {
              return false;
            }
            return true;
          }}
          search={accounts.table.search}
          onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
          saving={accounts.deleting.length !== 0 || accounts.updating.length !== 0 || accounts.creating}
          onRowAdd={() => dispatch(addAccountsTablePlaceholdersAction(1))}
          onRowSelect={(id: number) => dispatch(selectAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountsTableRowAction(id))}
          onRowDelete={(row: Table.IAccountRow) => dispatch(removeAccountAction(row.id))}
          onRowUpdate={(payload: Table.RowChange) => dispatch(updateAccountAction(payload))}
          onRowExpand={(id: number) => history.push(`/budgets/${budget.id}/accounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountsTableRowsAction())}
          footerRow={{
            identifier: "Grand Total",
            estimated:
              !isNil(budget.detail.data) && !isNil(budget.detail.data.estimated) ? budget.detail.data.estimated : 0.0,
            variance:
              !isNil(budget.detail.data) && !isNil(budget.detail.data.variance) ? budget.detail.data.variance : 0.0,
            actual: !isNil(budget.detail.data) && !isNil(budget.detail.data.actual) ? budget.detail.data.actual : 0.0
          }}
          columns={[
            {
              field: "identifier",
              headerName: "Account"
            },
            {
              field: "description",
              headerName: "Category Description"
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
      </WrapInApplicationSpinner>
      <CommentsHistoryDrawer
        commentsProps={{
          comments: comments.data,
          loading: comments.loading,
          submitting: comments.submitting,
          commentLoading: (comment: IComment) =>
            includes(comments.deleting, comment.id) ||
            includes(comments.editing, comment.id) ||
            includes(comments.replying, comment.id),
          onRequest: () => dispatch(requestBudgetCommentsAction()),
          onSubmit: (payload: Http.ICommentPayload) => dispatch(submitBudgetCommentAction({ data: payload })),
          onDoneEditing: (comment: IComment, value: string) =>
            dispatch(editBudgetCommentAction({ id: comment.id, data: { text: value } })),
          onDoneReplying: (comment: IComment, value: string) =>
            dispatch(submitBudgetCommentAction({ parent: comment.id, data: { text: value } })),
          onLike: (comment: IComment) => console.log(comment),
          onDelete: (comment: IComment) => dispatch(deleteBudgetCommentAction(comment.id))
        }}
        historyProps={{
          history: events.data,
          loading: events.loading,
          onRequest: () => dispatch(requestAccountsHistoryAction())
        }}
      />
    </React.Fragment>
  );
};

export default Accounts;
