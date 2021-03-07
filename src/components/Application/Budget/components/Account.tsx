import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef } from "ag-grid-community";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import {
  requestAccountAction,
  addAccountSubAccountsRowAction,
  deselectAccountSubAccountsRowAction,
  removeAccountSubAccountsRowAction,
  requestAccountSubAccountsAction,
  selectAccountSubAccountsRowAction,
  setAccountSubAccountsSearchAction,
  updateAccountSubAccountsRowAction,
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
      <RenderWithSpinner loading={accountStore.subaccounts.list.loading || accountStore.detail.loading}>
        <GenericBudgetTable<Redux.Budget.ISubAccountRow>
          table={accountStore.subaccounts.table}
          isCellEditable={(row: Redux.Budget.ISubAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual"], colDef.field)) {
              return false;
            } else if (includes(["line", "description", "name"], colDef.field)) {
              return true;
            } else {
              return row.subaccounts.length === 0;
            }
          }}
          search={accountStore.subaccounts.list.search}
          onSearch={(value: string) => dispatch(setAccountSubAccountsSearchAction(parseInt(accountId), value))}
          saving={
            accountStore.subaccounts.deleting.length !== 0 ||
            accountStore.subaccounts.updating.length !== 0 ||
            accountStore.subaccounts.creating
          }
          onRowAdd={() => dispatch(addAccountSubAccountsRowAction(parseInt(accountId)))}
          onRowSelect={(id: string | number) => dispatch(selectAccountSubAccountsRowAction(parseInt(accountId), id))}
          onRowDeselect={(id: string | number) =>
            dispatch(deselectAccountSubAccountsRowAction(parseInt(accountId), id))
          }
          onRowDelete={(row: Redux.Budget.ISubAccountRow) =>
            dispatch(removeAccountSubAccountsRowAction(parseInt(accountId), row))
          }
          onRowUpdate={(id: number | string, payload: { [key: string]: any }) =>
            dispatch(updateAccountSubAccountsRowAction(parseInt(accountId), parseInt(budgetId), { id, payload }))
          }
          onRowExpand={(id: string | number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountSubAccountsRowsAction(parseInt(accountId)))}
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
              headerName: "Quantity"
            },
            {
              field: "unit",
              headerName: "Unit"
            },
            {
              field: "multiplier",
              headerName: "X"
            },
            {
              field: "rate",
              headerName: "Rate"
            },
            {
              field: "estimated",
              headerName: "Estimated"
            },
            {
              field: "actual",
              headerName: "Actual"
            }
          ]}
        />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Account;
