import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import {
  requestSubAccountAction,
  requestSubAccountSubAccountsAction,
  setSubAccountSubAccountsSearchAction,
  selectSubAccountSubAccountsRowAction,
  addSubAccountSubAccountsRowAction,
  deselectSubAccountSubAccountsRowAction,
  removeSubAccountSubAccountsRowAction,
  updateSubAccountSubAccountsRowAction,
  selectAllSubAccountSubAccountsRowsAction
} from "../actions";
import { initialSubAccountState } from "../initialState";
import GenericBudgetTable from "./GenericBudgetTable";

const SubAccount = (): JSX.Element => {
  const { budgetId, subaccountId } = useParams<{ budgetId: string; subaccountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const subaccounts = useSelector((state: Redux.IApplicationStore) => {
    let subState = initialSubAccountState;
    if (!isNaN(parseInt(subaccountId))) {
      if (!isNil(state.budget.subaccounts[parseInt(subaccountId)])) {
        subState = state.budget.subaccounts[parseInt(subaccountId)];
      }
    }
    return subState.subaccounts;
  });

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(requestSubAccountAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(subaccountId) && !isNil(parseInt(subaccountId))) {
      dispatch(requestSubAccountSubAccountsAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  return (
    <RenderIfValidId id={[budgetId, subaccountId]}>
      <RenderWithSpinner loading={subaccounts.list.loading}>
        <GenericBudgetTable<Redux.Budget.ISubAccountRow>
          table={subaccounts.table}
          search={subaccounts.list.search}
          onSearch={(value: string) => dispatch(setSubAccountSubAccountsSearchAction(parseInt(subaccountId), value))}
          saving={subaccounts.deleting.length !== 0 || subaccounts.updating.length !== 0 || subaccounts.creating}
          onRowAdd={() => dispatch(addSubAccountSubAccountsRowAction(parseInt(subaccountId)))}
          onRowSelect={(id: string | number) =>
            dispatch(selectSubAccountSubAccountsRowAction(parseInt(subaccountId), id))
          }
          onRowDeselect={(id: string | number) =>
            dispatch(deselectSubAccountSubAccountsRowAction(parseInt(subaccountId), id))
          }
          onRowDelete={(row: Redux.Budget.ISubAccountRow) =>
            dispatch(removeSubAccountSubAccountsRowAction(parseInt(subaccountId), row))
          }
          onRowUpdate={(id: number | string, payload: { [key: string]: any }) =>
            dispatch(updateSubAccountSubAccountsRowAction(parseInt(subaccountId), { id, payload }))
          }
          onRowExpand={(id: string | number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
          onSelectAll={() => dispatch(selectAllSubAccountSubAccountsRowsAction(parseInt(subaccountId)))}
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

export default SubAccount;
