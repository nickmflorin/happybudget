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
  addAccountsRowAction,
  deselectAccountsRowAction,
  selectAccountsRowAction,
  removeAccountsRowAction,
  updateAccountsRowAction,
  selectAllAccountsRowsAction
} from "../actions";
import GenericBudgetTable from "./GenericBudgetTable";

const Accounts = (): JSX.Element => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const accounts = useSelector((state: Redux.IApplicationStore) => state.budget.accounts);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(budgetId))) {
      dispatch(requestBudgetAction(parseInt(budgetId)));
      dispatch(requestAccountsAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={budgetId}>
      <RenderWithSpinner loading={accounts.list.loading}>
        <GenericBudgetTable<Redux.Budget.IAccountRow>
          table={accounts.table}
          isCellEditable={(row: Redux.Budget.IAccountRow, colDef: ColDef) => {
            if (includes(["estimated", "actual", "variance"], colDef.field)) {
              return false;
            }
            return true;
          }}
          search={accounts.list.search}
          onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
          saving={accounts.deleting.length !== 0 || accounts.updating.length !== 0 || accounts.creating}
          onRowAdd={() => dispatch(addAccountsRowAction())}
          onRowSelect={(id: string | number) => dispatch(selectAccountsRowAction(id))}
          onRowDeselect={(id: string | number) => dispatch(deselectAccountsRowAction(id))}
          onRowDelete={(row: Redux.Budget.IAccountRow) => dispatch(removeAccountsRowAction(row))}
          onRowUpdate={(id: number | string, payload: { [key: string]: any }) =>
            dispatch(updateAccountsRowAction(parseInt(budgetId), { id, payload }))
          }
          onRowExpand={(id: string | number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
          onSelectAll={() => dispatch(selectAllAccountsRowsAction())}
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
              headerName: "Estimated"
            },
            {
              field: "actual",
              headerName: "Actual"
            },
            {
              field: "variance",
              headerName: "Variance"
            }
          ]}
        />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Accounts;
