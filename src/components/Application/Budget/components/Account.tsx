import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil } from "lodash";

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

  const subaccounts = useSelector((state: Redux.IApplicationStore) => {
    let subState = initialAccountState;
    if (!isNaN(parseInt(accountId))) {
      if (!isNil(state.budget.accounts.details[parseInt(accountId)])) {
        subState = state.budget.accounts.details[parseInt(accountId)];
      }
    }
    return subState.subaccounts;
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
      <RenderWithSpinner loading={subaccounts.list.loading}>
        <GenericBudgetTable<Redux.Budget.ISubAccountRow>
          table={subaccounts.table}
          search={subaccounts.list.search}
          onSearch={(value: string) => dispatch(setAccountSubAccountsSearchAction(parseInt(accountId), value))}
          saving={subaccounts.deleting.length !== 0 || subaccounts.updating.length !== 0 || subaccounts.creating}
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
              headerName: "Line",
              editable: true
            },
            {
              field: "description",
              headerName: "Category Description",
              editable: true
            },
            {
              field: "name",
              headerName: "Name",
              editable: true
            },
            {
              field: "quantity",
              headerName: "Quantity",
              editable: true
            },
            {
              field: "unit",
              headerName: "Unit",
              editable: true
            },
            {
              field: "multiplier",
              headerName: "X",
              editable: true
            },
            {
              field: "rate",
              headerName: "Rate",
              editable: true
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
