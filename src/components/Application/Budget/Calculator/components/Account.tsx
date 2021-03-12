import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef, ColSpanParams } from "ag-grid-community";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { GenericBudgetTable } from "components/tables";
import { formatCurrency } from "util/string";

import {
  setAccountIdAction,
  addAccountSubAccountsTablePlaceholdersAction,
  deselectAccountSubAccountsTableRowAction,
  removeAccountSubAccountAction,
  selectAccountSubAccountsTableRowAction,
  setAccountSubAccountsSearchAction,
  updateAccountSubAccountAction,
  selectAllAccountSubAccountsTableRowsAction
} from "../actions";

const Account = (): JSX.Element => {
  const { accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const accountStore = useSelector((state: Redux.IApplicationStore) => state.calculator.account);
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);

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
          search={accountStore.subaccounts.table.search}
          onSearch={(value: string) => dispatch(setAccountSubAccountsSearchAction(value))}
          saving={
            accountStore.subaccounts.deleting.length !== 0 ||
            accountStore.subaccounts.updating.length !== 0 ||
            accountStore.subaccounts.creating
          }
          rowRefreshRequired={(existing: Table.ISubAccountRow, row: Table.ISubAccountRow) => existing.unit !== row.unit}
          onRowAdd={() => dispatch(addAccountSubAccountsTablePlaceholdersAction(parseInt(accountId)))}
          onRowSelect={(id: number) => dispatch(selectAccountSubAccountsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountSubAccountsTableRowAction(id))}
          onRowDelete={(row: Table.ISubAccountRow) => dispatch(removeAccountSubAccountAction(row))}
          onRowUpdate={(id: number, data: { [key: string]: any }) =>
            dispatch(updateAccountSubAccountAction({ id, data }))
          }
          onRowExpand={(id: number) => history.push(`/budgets/${budget.id}/subaccounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountSubAccountsTableRowsAction())}
          estimated={
            !isNil(accountStore.detail.data) && !isNil(accountStore.detail.data.estimated)
              ? accountStore.detail.data.estimated
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
                !isNil(params.data.meta) && params.data.meta.subaccounts.length !== 0 ? 6 : 1
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
                onChange: (value: Unit, row: Table.ISubAccountRow) =>
                  dispatch(
                    updateAccountSubAccountAction({
                      id: row.id,
                      data: { unit: value }
                    })
                  )
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
              cellStyle: { textAlign: "right" }
            },
            {
              field: "actual",
              headerName: "Actual",
              cellStyle: { textAlign: "right" },
              cellRendererParams: { formatter: formatCurrency }
            }
          ]}
        />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Account;
