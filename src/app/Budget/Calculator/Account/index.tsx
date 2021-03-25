import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes, map } from "lodash";
import classNames from "classnames";
import { createSelector } from "reselect";

import { ColDef, ColSpanParams } from "ag-grid-community";

import BudgetTable from "lib/BudgetTable";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { CreateSubAccountGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/util";
import { formatCurrencyWithoutDollarSign } from "util/string";
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
  requestAccountSubAccountsHistoryAction,
  addGroupToAccountSubAccountsTableRowsAction,
  deleteAccountSubAccountsGroupAction
} from "../actions";

const selectBudgetId = (state: Redux.IApplicationStore) => state.budget.budget.id;

const selectAccountsTableData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table.data
);
const selectAccountsTableSearch = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table.search
);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.deleting,
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.updating,
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.creating,
  (deleting: number[], updating: number[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.detail
);
const selectDetailData = createSelector(
  selectAccountDetail,
  (detail: Redux.IDetailResponseStore<IAccount>) => detail.data
);
const selectAccountsTableLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table.loading
);
const selectDetailLoading = createSelector(
  selectAccountDetail,
  (detail: Redux.IDetailResponseStore<IAccount>) => detail.loading
);
const selectDeletingGroups = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.groups.deleting.length !== 0
);
const selectLoading = createSelector(
  selectDetailLoading,
  selectAccountsTableLoading,
  selectDeletingGroups,
  (detailLoading: boolean, tableLoading: boolean, deletingGroups: boolean) =>
    detailLoading || tableLoading || deletingGroups
);

const Account = (): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);

  const { accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const subaccountsTableData = useSelector(selectAccountsTableData);
  const subaccountsTableSearch = useSelector(selectAccountsTableSearch);
  const saving = useSelector(selectSaving);
  const detailData = useSelector(selectDetailData);
  const loading = useSelector(selectLoading);

  // TODO: Move selector functions outside of the component for these two selectors.
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.account.comments);
  const events = useSelector((state: Redux.IApplicationStore) => state.calculator.account.subaccounts.history);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  useEffect(() => {
    console.log("Table data changed");
  }, [selectAccountsTableData]);

  return (
    <RenderIfValidId id={[accountId]}>
      <RenderWithSpinner loading={loading}>
        <BudgetTable<Table.SubAccountRow, ISubAccountNestedGroup, ISimpleSubAccount>
          table={subaccountsTableData}
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
          search={subaccountsTableSearch}
          onSearch={(value: string) => dispatch(setAccountSubAccountsSearchAction(value))}
          saving={saving}
          rowRefreshRequired={(existing: Table.SubAccountRow, row: Table.SubAccountRow) => existing.unit !== row.unit}
          onRowAdd={() => dispatch(addAccountSubAccountsTablePlaceholdersAction(1))}
          onRowSelect={(id: number) => dispatch(selectAccountSubAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountSubAccountsTableRowAction(id))}
          onRowDelete={(row: Table.SubAccountRow) => dispatch(removeAccountSubAccountAction(row.id))}
          onRowUpdate={(payload: Table.RowChange) => dispatch(updateAccountSubAccountAction(payload))}
          onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
          groupParams={{
            onDeleteGroup: (group: ISubAccountNestedGroup) => dispatch(deleteAccountSubAccountsGroupAction(group.id)),
            onGroupRows: (rows: Table.SubAccountRow[]) =>
              setGroupSubAccounts(map(rows, (row: Table.SubAccountRow) => row.id))
          }}
          onSelectAll={() => dispatch(selectAllAccountSubAccountsTableRowsAction())}
          totals={{
            estimated: !isNil(detailData) && !isNil(detailData.estimated) ? detailData.estimated : 0.0,
            variance: !isNil(detailData) && !isNil(detailData.variance) ? detailData.variance : 0.0,
            actual: !isNil(detailData) && !isNil(detailData.actual) ? detailData.actual : 0.0
          }}
          bodyColumns={[
            {
              field: "description",
              headerName: "Category Description",
              flex: 100,
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
              cellClass: classNames("cell--centered", "cell--not-editable-bordered"),
              cellRenderer: "UnitCell",
              width: 20,
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
            dispatch(
              addGroupToAccountSubAccountsTableRowsAction({
                group: { id: group.id, color: group.color, name: group.name },
                ids: map(group.subaccounts, (subaccount: ISimpleSubAccount) => subaccount.id)
              })
            );
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
    </RenderIfValidId>
  );
};

export default Account;
