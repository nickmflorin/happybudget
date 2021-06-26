import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, map, filter, reduce } from "lodash";
import { createSelector } from "reselect";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/pro-solid-svg-icons";

import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import * as models from "lib/model";
import { getKeyValue } from "lib/util";
import { findChoiceForName, inferModelFromName } from "lib/model/util";
import { currencyValueFormatter, dateValueFormatter } from "lib/model/formatters";
import { floatValueSetter, dateTimeValueSetter } from "lib/model/valueSetters";

import { WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import * as actions from "../../store/actions/budget/actuals";
import BudgetTableComponent from "../BudgetTable";
import { useDeepEqualMemo } from "lib/hooks";

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

const Actuals = (): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectActualsLoading);
  const data = useSelector(selectActuals);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);

  useEffect(() => {
    dispatch(actions.requestActualsAction(null));
  }, []);

  // NOTE: Right now, the total actual value for a budget can differ from totaling the actual
  // rows of the actuals table.  This can occur if the actual is not yet assigned to a
  // subaccount.  For now, we will not worry about that.
  const actualsTableTotal = useMemo(() => {
    return reduce(data, (sum: number, s: Model.Actual) => sum + (s.value || 0), 0);
  }, [useDeepEqualMemo(data)]);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          items={[
            {
              id: "actuals",
              primary: true,
              text: "Actuals Log",
              tooltip: { title: "Actuals Log", placement: "bottom" }
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <BudgetTableComponent<BudgetTable.ActualRow, Model.Actual, Model.Group, Http.ActualPayload>
          data={data}
          manager={models.ActualRowManager}
          identifierField={"subaccount"}
          identifierFieldHeader={"Account"}
          tableFooterIdentifierValue={"Actuals Total"}
          identifierColumn={{
            type: "singleSelect",
            minWidth: 200,
            maxWidth: 200,
            width: 200,
            processCellForClipboard: (row: BudgetTable.ActualRow) => {
              if (!isNil(row.subaccount)) {
                return row.subaccount.identifier || "";
              }
              return "";
            },
            processCellFromClipboard: (name: string) => {
              if (name.trim() === "") {
                return null;
              }
              const availableSubAccounts: Model.SimpleSubAccount[] = filter(
                map(data, (actual: Model.Actual) => actual.subaccount),
                (sub: Model.SimpleSubAccount | null) => sub !== null && sub.identifier !== null
              ) as Model.SimpleSubAccount[];
              // NOTE: If there are multiple sub accounts with the same identifier, this will
              // return the first and issue a warning.
              const subaccount = inferModelFromName<Model.SimpleSubAccount>(availableSubAccounts, name, {
                nameField: "identifier"
              });
              return subaccount;
            },
            cellRenderer: "BudgetItemCell",
            cellEditor: "SubAccountsTreeEditor",
            cellEditorParams: {
              setSearch: (value: string) => dispatch(actions.setSubAccountsTreeSearchAction(value))
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
          onRowAdd={(payload: Table.RowAddPayload<BudgetTable.ActualRow>) =>
            dispatch(actions.bulkCreateActualsAction(payload))
          }
          onRowDelete={(row: BudgetTable.ActualRow) => dispatch(actions.removeActualAction(row.id))}
          onTableChange={(payload: Table.Change<BudgetTable.ActualRow>) =>
            dispatch(actions.tableChangedAction(payload))
          }
          exportFileName={"actuals.csv"}
          actions={(params: BudgetTable.MenuActionParams<BudgetTable.ActualRow>) => [
            {
              tooltip: "Delete",
              icon: <FontAwesomeIcon icon={faTrashAlt} />,
              onClick: () => {
                const rows: BudgetTable.ActualRow[] = params.api.getSelectedRows();
                map(rows, (row: BudgetTable.ActualRow) => dispatch(actions.removeActualAction(row.id)));
              }
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
                const payment_method = getKeyValue<BudgetTable.ActualRow, keyof BudgetTable.ActualRow>(
                  "payment_method"
                )(row);
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
              cellRenderer: "BodyCell",
              type: "currency",
              tableTotal: actualsTableTotal
            }
          ]}
        />
      </WrapInApplicationSpinner>
    </React.Fragment>
  );
};

export default Actuals;
