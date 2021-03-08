import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";

import { ColDef } from "ag-grid-community";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import {
  requestBudgetAction,
  requestAccountsAction,
  setAccountsSearchAction,
  addAccountsPlaceholdersAction,
  deselectAccountsRowAction,
  selectAccountsRowAction,
  removeAccountAction,
  updateAccountAction,
  selectAllAccountsRowsAction
} from "../actions";
import GenericBudgetTable from "./GenericBudgetTable";

const Accounts = (): JSX.Element => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const accounts = useSelector((state: Redux.IApplicationStore) => state.budget.accounts);
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(budgetId))) {
      dispatch(requestBudgetAction(parseInt(budgetId)));
      dispatch(requestAccountsAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={budgetId}>
      <RenderWithSpinner loading={accounts.table.loading || budget.loading}>
        <GenericBudgetTable<Redux.Budget.AccountRowField, Redux.Budget.IBudgetRowMeta, Redux.Budget.IAccountRow>
          table={accounts.table.data}
          isCellEditable={(row: Redux.Budget.IAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "variance"], colDef.field)) {
              return false;
            }
            return true;
          }}
          search={accounts.table.search}
          onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
          saving={accounts.deleting.length !== 0 || accounts.updating.length !== 0 || accounts.creating}
          onRowAdd={() => dispatch(addAccountsPlaceholdersAction())}
          onRowSelect={(id: number) => dispatch(selectAccountsRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectAccountsRowAction(id))}
          onRowDelete={(row: Redux.Budget.IAccountRow) => dispatch(removeAccountAction(row))}
          onRowUpdate={(id: number, payload: { [key: string]: any }) =>
            dispatch(updateAccountAction(parseInt(budgetId), { id, payload }))
          }
          onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountsRowsAction())}
          estimated={!isNil(budget.data) && !isNil(budget.data.estimated) ? budget.data.estimated : 0.0}
          columns={[
            {
              field: "account_number",
              headerName: "Account"
            },
            {
              field: "description",
              headerName: "Category Description"
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
            },
            {
              field: "variance",
              headerName: "Variance",
              cellStyle: { textAlign: "right" }
            }
          ]}
        />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Accounts;
