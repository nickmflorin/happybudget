import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil } from "lodash";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import {
  requestBudgetAction,
  requestActualsAction,
  setActualsSearchAction,
  addActualsTablePlaceholdersAction,
  deselectActualsTableRowAction,
  selectActualsTableRowAction,
  removeActualAction,
  updateActualAction,
  selectAllActualsTableRowsAction
} from "../actions";
import GenericBudgetTable from "./GenericBudgetTable";

const Actuals = (): JSX.Element => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const dispatch = useDispatch();
  const actuals = useSelector((state: Redux.IApplicationStore) => state.budget.actuals);
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(budgetId))) {
      dispatch(requestBudgetAction(parseInt(budgetId)));
      dispatch(requestActualsAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={budgetId}>
      <RenderWithSpinner loading={actuals.table.loading || budget.loading}>
        <GenericBudgetTable<Table.ActualRowField, Table.IActualRowMeta, Table.IActualRow>
          table={actuals.table.data}
          isCellEditable={() => true}
          search={actuals.table.search}
          onSearch={(value: string) => dispatch(setActualsSearchAction(value))}
          saving={actuals.deleting.length !== 0 || actuals.updating.length !== 0 || actuals.creating}
          onRowAdd={() => dispatch(addActualsTablePlaceholdersAction())}
          onRowSelect={(id: number) => dispatch(selectActualsTableRowAction(id))}
          onRowDeselect={(id: number) => dispatch(deselectActualsTableRowAction(id))}
          onRowDelete={(row: Table.IActualRow) => dispatch(removeActualAction(row))}
          onRowUpdate={(id: number, data: { [key: string]: any }) =>
            dispatch(updateActualAction(parseInt(budgetId), { id, data }))
          }
          onSelectAll={() => dispatch(selectAllActualsTableRowsAction())}
          estimated={!isNil(budget.data) && !isNil(budget.data.estimated) ? budget.data.estimated : 0.0}
          columns={[
            {
              field: "parent",
              headerName: "Account"
            },
            {
              field: "description",
              headerName: "Description"
            },
            {
              field: "vendor",
              headerName: "Vendor"
            },
            {
              field: "purchase_order",
              headerName: "Purchase Order"
            },
            {
              field: "date",
              headerName: "Date",
              cellStyle: { textAlign: "right" }
            },
            {
              field: "payment_method",
              headerName: "Payment Method"
            },
            {
              field: "payment_id",
              headerName: "Payment ID"
            },
            {
              field: "value",
              headerName: "Actual",
              cellStyle: { textAlign: "right" }
            }
          ]}
        />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Actuals;
