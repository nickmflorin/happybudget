import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef } from "ag-grid-community";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import {
  requestAccountAction,
  addAccountSubAccountsPlaceholdersAction,
  deselectAccountSubAccountsRowAction,
  removeAccountSubAccountAction,
  requestAccountSubAccountsAction,
  selectAccountSubAccountsRowAction,
  setAccountSubAccountsSearchAction,
  updateAccountSubAccountAction,
  selectAllAccountSubAccountsRowsAction
} from "../actions";
import { initialAccountState } from "../initialState";
import GenericBudgetTable from "./GenericBudgetTable";

const Account = (): JSX.Element => {
  const { budgetId, accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const accountStore = useSelector((state: Redux.IApplicationStore) => {
    let subState = initialAccountState;
    if (!isNaN(parseInt(accountId))) {
      if (!isNil(state.budget.accounts.details[parseInt(accountId)])) {
        subState = state.budget.accounts.details[parseInt(accountId)];
      }
    }
    return subState;
  });

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(requestAccountAction(parseInt(accountId)));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(budgetId)) && !isNil(accountId) && !isNil(parseInt(accountId))) {
      dispatch(requestAccountSubAccountsAction(parseInt(accountId), parseInt(budgetId)));
    }
  }, [budgetId, accountId]);

  return (
    <RenderIfValidId id={[budgetId, accountId]}>
      <RenderWithSpinner loading={accountStore.subaccounts.table.loading || accountStore.detail.loading}>
        <GenericBudgetTable<Redux.Budget.SubAccountRowField, Redux.Budget.IBudgetRowMeta, Redux.Budget.ISubAccountRow>
          table={accountStore.subaccounts.table.data}
          isCellEditable={(row: Redux.Budget.ISubAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "unit"], colDef.field)) {
              return false;
            } else if (includes(["line", "description", "name"], colDef.field)) {
              return true;
            } else {
              return row.meta.subaccounts.length === 0;
            }
          }}
          search={accountStore.subaccounts.table.search}
          onSearch={(value: string) => dispatch(setAccountSubAccountsSearchAction(parseInt(accountId), value))}
          saving={
            accountStore.subaccounts.deleting.length !== 0 ||
            accountStore.subaccounts.updating.length !== 0 ||
            accountStore.subaccounts.creating
          }
          onRowAdd={() => dispatch(addAccountSubAccountsPlaceholdersAction(parseInt(accountId)))}
          onRowSelect={(id: number) => dispatch(selectAccountSubAccountsRowAction(parseInt(accountId), id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountSubAccountsRowAction(parseInt(accountId), id))}
          onRowDelete={(row: Redux.Budget.ISubAccountRow) =>
            dispatch(removeAccountSubAccountAction(parseInt(accountId), row))
          }
          onRowUpdate={(id: number, payload: { [key: string]: any }) =>
            dispatch(updateAccountSubAccountAction(parseInt(accountId), parseInt(budgetId), { id, payload }))
          }
          onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountSubAccountsRowsAction(parseInt(accountId)))}
          estimated={
            !isNil(accountStore.detail.data) && !isNil(accountStore.detail.data.estimated)
              ? accountStore.detail.data.estimated
              : 0.0
          }
          columns={[
            {
              field: "line",
              headerName: "Line"
            },
            {
              field: "description",
              headerName: "Category Description"
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
                onChange: (value: Unit, row: Redux.Budget.ISubAccountRow) =>
                  dispatch(
                    updateAccountSubAccountAction(parseInt(accountId), parseInt(budgetId), {
                      id: row.id,
                      payload: { unit: value }
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
              cellStyle: { textAlign: "right" }
            }
          ]}
        />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Account;
