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
import * as actions from "../../store/actions/budget/actuals";
import { selectBudgetDetail } from "../../store/selectors";
import BudgetTableComponent from "../BudgetTable";

const selectSelectedRows = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.selected
);
const selectActuals = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.budgeting.budget.actuals.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.search
);
const selectActualsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.loading
);
const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.updating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectBudgetItems = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.budgetItems.data
);

const Actuals = (): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectActualsLoading);
  const budgetItems = useSelector(selectBudgetItems);
  const data = useSelector(selectActuals);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const budgetDetail = useSelector(selectBudgetDetail);

  useEffect(() => {
    dispatch(setInstanceAction(null));
    dispatch(actions.requestActualsAction(null));
    dispatch(actions.requestBudgetItemsAction(null));
    dispatch(actions.requestBudgetItemsTreeAction(null));
  }, []);

  return (
    <WrapInApplicationSpinner loading={loading}>
      <BudgetTableComponent<BudgetTable.ActualRow, Model.Actual, Model.Group, Http.ActualPayload>
        data={data}
        manager={models.ActualRowManager}
        selected={selected}
        identifierField={"account"}
        identifierFieldHeader={"Account"}
        identifierColumn={{
          type: "singleSelect",
          minWidth: 200,
          maxWidth: 200,
          width: 200,
          processCellForClipboard: (row: BudgetTable.ActualRow) => {
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
            setSearch: (value: string) => dispatch(actions.setBudgetItemsTreeSearchAction(value))
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
        onSearch={(value: string) => dispatch(actions.setActualsSearchAction(value))}
        saving={saving}
        sizeColumnsToFit={false}
        onRowAdd={() => dispatch(actions.bulkCreateActualsAction(1))}
        onRowSelect={(id: number) => dispatch(actions.selectActualAction(id))}
        onRowDeselect={(id: number) => dispatch(actions.deselectActualAction(id))}
        onRowDelete={(row: BudgetTable.ActualRow) => dispatch(actions.removeActualAction(row.id))}
        onTableChange={(payload: Table.Change<BudgetTable.ActualRow>) => dispatch(actions.tableChangedAction(payload))}
        onSelectAll={() => dispatch(actions.selectAllActualsAction(null))}
        exportFileName={"actuals.csv"}
        actions={(params: BudgetTable.MenuActionParams<BudgetTable.ActualRow>) => [
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
            headerName: "Contact",
            flex: 1,
            type: "contact"
          },
          {
            field: "purchase_order",
            headerName: "Purchase Order",
            flex: 1,
            type: "number"
          },
          {
            field: "date",
            headerName: "Date",
            flex: 1,
            valueFormatter: dateValueFormatter,
            valueSetter: dateTimeValueSetter<BudgetTable.ActualRow>("date"),
            type: "date"
          },
          {
            field: "payment_method",
            headerName: "Pay Method",
            cellClass: "cell--centered",
            cellRenderer: "PaymentMethodCell",
            flex: 1,
            cellEditor: "PaymentMethodCellEditor",
            type: "singleSelect",
            // Required to allow the dropdown to be selectable on Enter key.
            suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
              if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
                return true;
              }
              return false;
            },
            processCellForClipboard: (row: BudgetTable.ActualRow) => {
              const payment_method = getKeyValue<BudgetTable.ActualRow, keyof BudgetTable.ActualRow>("payment_method")(
                row
              );
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
            type: "number"
          },
          {
            field: "value",
            headerName: "Amount",
            flex: 1,
            valueFormatter: currencyValueFormatter,
            valueSetter: floatValueSetter<BudgetTable.ActualRow>("value"),
            tableTotal: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0,
            type: "currency"
          }
        ]}
      />
    </WrapInApplicationSpinner>
  );
};

export default Actuals;
