import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes, map } from "lodash";

import { ColDef, ColSpanParams } from "ag-grid-community";

import BudgetTable from "lib/BudgetTable";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { CreateSubAccountGroupModal } from "components/modals";
import { formatCurrency } from "util/string";
import { generateRandomNumericId } from "util/math";
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
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);

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
        <BudgetTable<Table.SubAccountRow, ISubAccountNestedGroup, ISimpleSubAccount>
          table={accountStore.subaccounts.table.data}
          identifierField={"identifier"}
          identifierFieldHeader={"Line"}
          isCellEditable={(row: Table.SubAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "unit", "variance"], colDef.field)) {
              return false;
            } else if (includes(["identifier", "description", "name"], colDef.field)) {
              return true;
            } else {
              return !isNil(row.meta) && row.meta.children.length === 0;
            }
          }}
          highlightNonEditableCell={(row: Table.SubAccountRow, colDef: ColDef) => {
            return !includes(["quantity", "multiplier", "rate", "unit"], colDef.field);
          }}
          search={accountStore.subaccounts.table.search}
          onSearch={(value: string) => dispatch(setAccountSubAccountsSearchAction(value))}
          saving={
            accountStore.subaccounts.deleting.length !== 0 ||
            accountStore.subaccounts.updating.length !== 0 ||
            accountStore.subaccounts.creating
          }
          rowRefreshRequired={(existing: Table.SubAccountRow, row: Table.SubAccountRow) => existing.unit !== row.unit}
          onRowAdd={() => dispatch(addAccountSubAccountsTablePlaceholdersAction(1))}
          onRowSelect={(id: number) => dispatch(selectAccountSubAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountSubAccountsTableRowAction(id))}
          onRowDelete={(row: Table.SubAccountRow) => dispatch(removeAccountSubAccountAction(row.id))}
          onRowUpdate={(payload: Table.RowChange) => dispatch(updateAccountSubAccountAction(payload))}
          onRowExpand={(id: number) => history.push(`/budgets/${budget.id}/subaccounts/${id}`)}
          groupParams={{
            createFooter: (group: ISubAccountNestedGroup) => ({
              id: generateRandomNumericId(),
              name: null,
              identifier: null,
              unit: null,
              multiplier: null,
              rate: null,
              quantity: null,
              description: null,
              estimated: null,
              variance: null,
              actual: null,
              group: null,
              meta: {
                isPlaceholder: true,
                isGroupFooter: true,
                selected: false,
                children: [],
                errors: []
              }
            }),
            onGroupRows: (rows: Table.SubAccountRow[]) =>
              setGroupSubAccounts(map(rows, (row: Table.SubAccountRow) => row.id))
          }}
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
          bodyColumns={[
            {
              field: "description",
              headerName: "Category Description",
              colSpan: (params: ColSpanParams) => {
                // Not totally sure why this conditional is necessary, but it's necessity might
                // be a symptom of another problem.  We should investigate.
                if (
                  !isNil(params.node) &&
                  params.node.group === false &&
                  !isNil(params.data.meta) &&
                  !isNil(params.data.meta.children)
                ) {
                  return !isNil(params.data) && !isNil(params.data.meta) && params.data.meta.children.length !== 0
                    ? 6
                    : 1;
                }
                return 1;
              }
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
                onChange: (unit: Unit, row: Table.SubAccountRow) =>
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
            }
          ]}
          calculatedColumns={[
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
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={parseInt(accountId)}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: ISubAccountGroup) => {
            setGroupSubAccounts(undefined);
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
    </RenderIfValidId>
  );
};

export default Account;
