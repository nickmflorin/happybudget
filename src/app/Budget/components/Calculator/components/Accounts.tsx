import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef } from "ag-grid-community";

import { RenderWithSpinner } from "components/display";
import { CommentsHistoryDrawer } from "components/drawers";
import { GenericBudgetTable } from "components/tables";
import { formatCurrency } from "util/string";

import { setAncestorsAction } from "../../../actions";
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
  requestBudgetCommentsAction
} from "../actions";

const Accounts = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const accounts = useSelector((state: Redux.IApplicationStore) => state.calculator.accounts);
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);
  const commentsHistoryDrawerOpen = useSelector(
    (state: Redux.IApplicationStore) => state.budget.commentsHistoryDrawerOpen
  );
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.accounts.comments);

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
      <RenderWithSpinner loading={accounts.table.loading || budget.detail.loading}>
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
          onRowAdd={() => dispatch(addAccountsTablePlaceholdersAction())}
          onRowSelect={(id: number) => dispatch(selectAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountsTableRowAction(id))}
          onRowDelete={(row: Table.IAccountRow) => dispatch(removeAccountAction(row))}
          onRowUpdate={(id: number, data: { [key: string]: any }) => dispatch(updateAccountAction({ id, data }))}
          onRowExpand={(id: number) => history.push(`/budgets/${budget.id}/accounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountsTableRowsAction())}
          estimated={
            !isNil(budget.detail.data) && !isNil(budget.detail.data.estimated) ? budget.detail.data.estimated : 0.0
          }
          actual={!isNil(budget.detail.data) && !isNil(budget.detail.data.actual) ? budget.detail.data.actual : 0.0}
          variance={
            !isNil(budget.detail.data) && !isNil(budget.detail.data.variance) ? budget.detail.data.variance : 0.0
          }
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
      </RenderWithSpinner>
      <CommentsHistoryDrawer
        visible={commentsHistoryDrawerOpen}
        commentsProps={{
          comments: comments.data,
          loading: comments.loading,
          submitting: comments.submitting,
          onRequest: () => dispatch(requestBudgetCommentsAction()),
          onSubmit: (payload: Http.ICommentPayload) => dispatch(submitBudgetCommentAction(payload)),
          onEdit: (comment: IComment) => console.log(comment),
          onLike: (comment: IComment) => console.log(comment),
          onDislike: (comment: IComment) => console.log(comment),
          onDelete: (comment: IComment) => console.log(comment)
        }}
      />
    </React.Fragment>
  );
};

export default Accounts;
