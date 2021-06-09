import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, find } from "lodash";
import { createSelector } from "reselect";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/pro-solid-svg-icons";

import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import * as models from "lib/model";
import { getKeyValue } from "lib/util";
import { findChoiceForName } from "lib/model/util";
import { currencyValueFormatter, dateValueFormatter } from "lib/model/formatters";
import { floatValueSetter, dateTimeValueSetter } from "lib/model/valueSetters";

import { WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../../store/actions/budget";
import {
  requestActualsAction,
  setActualsSearchAction,
  addPlaceholdersToStateAction,
  deselectActualAction,
  selectActualAction,
  removeActualAction,
  selectAllActualsAction,
  tableChangedAction,
  requestBudgetItemsAction,
  requestBudgetItemsTreeAction,
  setBudgetItemsTreeSearchAction
} from "../../store/actions/budget/actuals";
import { selectBudgetDetail } from "../../store/selectors";
import BudgetTable from "../BudgetTable";

const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.actuals.selected
);
const selectActuals = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budgeting.budget.actuals.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.actuals.search
);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.actuals.placeholders
);
const selectActualsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.actuals.loading
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.actuals.deleting,
  (state: Redux.ApplicationStore) => state.budgeting.budget.actuals.updating,
  (state: Redux.ApplicationStore) => state.budgeting.budget.actuals.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectBudgetItems = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.budgetItems.data
);

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
    dispatch(requestBudgetItemsAction(null));
    dispatch(requestBudgetItemsTreeAction(null));
  }, []);

  return (
    <WrapInApplicationSpinner loading={loading}>
      <BudgetTable<Table.ActualRow, Model.Actual, Model.Group, Http.ActualPayload>
        data={data}
        placeholders={placeholders}
        manager={models.ActualRowManager}
        selected={selected}
        identifierField={"account"}
        identifierFieldHeader={"Account"}
        identifierColumn={{
          minWidth: 200,
          maxWidth: 200,
          width: 200,
          processCellForClipboard: (row: Table.ActualRow) => {
            if (!isNil(row.account)) {
              const item: Model.BudgetLineItem | undefined = find(budgetItems, {
                id: row.account.id,
                type: row.account.type
              } as any);
              if (!isNil(item)) {
                return item.identifier || "";
              }
            }
            return "";
          },
          cellRenderer: "BudgetItemCell",
          cellEditor: "BudgetItemsTreeEditor",
          cellEditorParams: {
            setSearch: (value: string) => dispatch(setBudgetItemsTreeSearchAction(value))
          },
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          }
        }}
        indexColumn={{ width: 40, maxWidth: 50 }}
        search={search}
        onSearch={(value: string) => dispatch(setActualsSearchAction(value))}
        saving={saving}
        sizeColumnsToFit={false}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectActualAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectActualAction(id))}
        onRowDelete={(row: Table.ActualRow) => dispatch(removeActualAction(row.id))}
        onTableChange={(payload: Table.Change<Table.ActualRow>) => dispatch(tableChangedAction(payload))}
        onSelectAll={() => dispatch(selectAllActualsAction(null))}
        exportFileName={"actuals.csv"}
        actions={(params: BudgetTable.MenuActionParams<Table.ActualRow, Model.Group>) => [
          {
            tooltip: "Delete",
            icon: <FontAwesomeIcon icon={faTrashAlt} />,
            disabled: params.selectedRows.length === 0,
            onClick: params.onDelete
          }
        ]}
        columns={[
          {
            field: "description",
            headerName: "Description",
            flex: 3,
            type: "longText"
          },
          {
            field: "vendor",
            headerName: "Vendor",
            flex: 1,
            type: "text"
          },
          {
            field: "purchase_order",
            headerName: "Purchase Order",
            flex: 1,
            type: "text"
          },
          {
            field: "date",
            headerName: "Date",
            cellStyle: { textAlign: "right" },
            flex: 1,
            valueFormatter: dateValueFormatter,
            valueSetter: dateTimeValueSetter<Table.ActualRow>("date"),
            type: "date"
          },
          {
            field: "payment_method",
            headerName: "Pay Method",
            cellClass: "cell--centered",
            cellRenderer: "PaymentMethodCell",
            flex: 1,
            cellEditor: "PaymentMethodCellEditor",
            clearBeforeEdit: true,
            type: "singleSelect",
            // Required to allow the dropdown to be selectable on Enter key.
            suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
              if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
                return true;
              }
              return false;
            },
            processCellForClipboard: (row: Table.ActualRow) => {
              const payment_method = getKeyValue<Table.ActualRow, keyof Table.ActualRow>("payment_method")(row);
              if (isNil(payment_method)) {
                return "";
              }
              return payment_method.name;
            },
            processCellFromClipboard: (name: string) => {
              if (name.trim() === "") {
                return null;
              }
              const payment_method = findChoiceForName<Model.PaymentMethod>(models.PaymentMethods, name);
              if (!isNil(payment_method)) {
                return payment_method;
              }
              return null;
            }
          },
          {
            field: "payment_id",
            headerName: "Pay ID",
            flex: 1,
            type: "text"
          },
          {
            field: "value",
            headerName: "Amount",
            flex: 1,
            valueFormatter: currencyValueFormatter,
            valueSetter: floatValueSetter<Table.ActualRow>("value"),
            tableTotal: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0,
            type: "text"
          }
        ]}
      />
    </WrapInApplicationSpinner>
  );
};

export default Actuals;
