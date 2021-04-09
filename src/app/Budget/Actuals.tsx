import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, find } from "lodash";
import { createSelector } from "reselect";

import { CellClassParams } from "ag-grid-community";

import { WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { PaymentMethodModelsList } from "lib/model";
import { currencyValueFormatter, dateValueFormatter } from "lib/tabling/formatters";
import { ActualMapping } from "lib/tabling/mappings";
import { processOptionModelCellForClipboard } from "lib/tabling/processor";
import { optionModelValueSetter, floatValueSetter, dateTimeValueSetter } from "lib/tabling/valueSetters";

import { setInstanceAction } from "./store/actions";
import {
  requestActualsAction,
  setActualsSearchAction,
  addPlaceholdersToStateAction,
  deselectActualAction,
  selectActualAction,
  removeActualAction,
  updateActualAction,
  selectAllActualsAction,
  bulkUpdateBudgetActualsAction
} from "./store/actions/actuals";
import { selectBudgetDetail } from "./store/selectors";
import BudgetTable, { GetExportValueParams } from "./BudgetTable";

const selectSelectedRows = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.actuals.selected);
const selectActuals = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.actuals.data);
const selectTableSearch = simpleShallowEqualSelector((state: Redux.IApplicationStore) => state.budget.actuals.search);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.actuals.placeholders
);
const selectActualsLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.actuals.loading
);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.budget.actuals.deleting,
  (state: Redux.IApplicationStore) => state.budget.actuals.updating,
  (state: Redux.IApplicationStore) => state.budget.actuals.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectBudgetItems = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.budgetItems.data);

const Actuals = (): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectActualsLoading);
  const budgetItems = useSelector(selectBudgetItems);
  const data = useSelector(selectActuals);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const budgetDetail = useSelector(selectBudgetDetail);

  useEffect(() => {
    dispatch(setInstanceAction(null));
    dispatch(requestActualsAction(null));
  }, []);

  return (
    <WrapInApplicationSpinner loading={loading}>
      <BudgetTable<Table.ActualRow, IActual, IGroup<any>, Http.IActualPayload>
        data={data}
        placeholders={placeholders}
        mapping={ActualMapping}
        selected={selected}
        identifierField={"object_id"}
        identifierFieldHeader={"Account"}
        identifierColumn={{
          minWidth: 200,
          cellClass: "borderless",
          cellRenderer: "BudgetItemCell",
          cellRendererParams: {
            onChange: (object_id: number, parent_type: BudgetItemType, row: Table.ActualRow) => {
              dispatch(
                updateActualAction({
                  id: row.id,
                  data: {
                    object_id: { newValue: object_id, oldValue: row.object_id },
                    parent_type: { oldValue: row.parent_type, newValue: parent_type }
                  }
                })
              );
            }
          }
        }}
        indexColumn={{ width: 40, maxWidth: 50 }}
        nonEditableCells={["object_id"]}
        search={search}
        onSearch={(value: string) => dispatch(setActualsSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectActualAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectActualAction(id))}
        onRowDelete={(row: Table.ActualRow) => dispatch(removeActualAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateActualAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange[]) => dispatch(bulkUpdateBudgetActualsAction(changes))}
        onSelectAll={() => dispatch(selectAllActualsAction(null))}
        rowRefreshRequired={(existing: Table.ActualRow, row: Table.ActualRow) => {
          return (
            existing.object_id !== row.object_id ||
            existing.parent_type !== row.parent_type ||
            existing.payment_method !== row.payment_method
          );
        }}
        tableTotals={{
          value: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? String(budgetDetail.actual) : "0.00"
        }}
        cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
        exportFileName={"actuals.csv"}
        processCellForClipboard={processOptionModelCellForClipboard<Table.ActualRow, PaymentMethodOptionModel>(
          "payment_method",
          PaymentMethodModelsList
        )}
        getExportValue={{
          object_id: ({ node }: GetExportValueParams) => {
            const item = find(budgetItems, { id: node.data.object_id, type: node.data.parent_type });
            if (!isNil(item)) {
              return item.identifier;
            }
            return "";
          }
        }}
        bodyColumns={[
          {
            field: "description",
            headerName: "Description",
            flex: 100
          },
          {
            field: "vendor",
            headerName: "Vendor",
            flex: 1
          },
          {
            field: "purchase_order",
            headerName: "Purchase Order",
            flex: 1
          },
          {
            field: "date",
            headerName: "Date",
            cellStyle: { textAlign: "right" },
            flex: 1,
            valueFormatter: dateValueFormatter,
            valueSetter: dateTimeValueSetter<Table.ActualRow>("date")
          },
          {
            field: "payment_method",
            headerName: "Payment Method",
            cellClass: "cell--centered",
            cellRenderer: "PaymentMethodsCell",
            flex: 1,
            valueSetter: optionModelValueSetter<Table.ActualRow, PaymentMethodOptionModel>(
              "payment_method",
              PaymentMethodModelsList,
              { allowNull: true }
            )
          },
          {
            field: "payment_id",
            headerName: "Payment ID",
            flex: 1
          },
          {
            field: "value",
            headerName: "Actual",
            flex: 1,
            valueFormatter: currencyValueFormatter,
            valueSetter: floatValueSetter<Table.ActualRow>("value")
          }
        ]}
      />
    </WrapInApplicationSpinner>
  );
};

export default Actuals;
