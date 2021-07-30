import { ReactNode } from "react";
import { isNil, includes, find, filter, map } from "lodash";
import classNames from "classnames";

import { faSigma, faPercentage, faTrashAlt, faLineColumns, faFileCsv } from "@fortawesome/pro-solid-svg-icons";

import { ColDef, ColSpanParams, SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { FieldsDropdown } from "components/dropdowns";

import { getKeyValue } from "lib/util";
import { downloadAsCsvFile } from "lib/util/files";
import { inferModelFromName, getModelsByIds } from "lib/model/util";
import { agCurrencyValueFormatter } from "lib/model/formatters";
import { floatValueSetter, integerValueSetter } from "lib/model/valueSetters";

import BudgetTableComponent from "../BudgetTable";

export interface GenericSubAccountsTableProps
  extends Omit<
    BudgetTable.Props<BudgetTable.SubAccountRow, Model.SubAccount, Http.SubAccountPayload>,
    "rowCanExpand" | "manager" | "levelType"
  > {
  exportFileName: string;
  categoryName: "Sub Account" | "Detail";
  identifierFieldHeader: "Account" | "Line";
  fringes: Model.Fringe[];
  fringesCellEditor: "FringesCellEditor" | "FringesCellEditor" | "FringesCellEditor" | "FringesCellEditor";
  fringesCellEditorParams: {
    colId: keyof BudgetTable.SubAccountRow;
    onAddFringes: () => void;
  };
  tableFooterIdentifierValue: string;
  budgetFooterIdentifierValue?: string;
  subAccountUnits: Model.Tag[];
  levelType: "account" | "subaccount";
  onGroupRows: (rows: BudgetTable.SubAccountRow[]) => void;
  onEditFringes: () => void;
}

const GenericSubAccountsTable = ({
  /* eslint-disable indent */
  categoryName,
  identifierFieldHeader,
  fringes,
  fringesCellEditor,
  fringesCellEditorParams,
  subAccountUnits,
  exportFileName,
  budgetFooterIdentifierValue = "Budget Total",
  tableFooterIdentifierValue,
  onGroupRows,
  onEditFringes,
  ...props
}: GenericSubAccountsTableProps): JSX.Element => {
  return (
    <BudgetTableComponent<BudgetTable.SubAccountRow, Model.SubAccount, Http.SubAccountPayload>
      isCellEditable={(row: BudgetTable.SubAccountRow, colDef: ColDef) => {
        if (includes(["identifier", "description", "name"], colDef.field)) {
          return true;
        } else {
          return !isNil(row.meta.children) && row.meta.children.length === 0;
        }
      }}
      onGroupRows={onGroupRows}
      rowCanExpand={(row: BudgetTable.SubAccountRow) =>
        !isNil(row.identifier) || (!isNil(row.meta.children) && row.meta.children.length !== 0)
      }
      getModelChildren={(model: Model.SubAccount) => model.subaccounts}
      getModelLabel={(model: Model.SubAccount) => model.identifier || model.description}
      {...props}
      actions={(params: BudgetTable.MenuActionParams<BudgetTable.SubAccountRow, Model.SubAccount>) => [
        {
          tooltip: "Delete",
          icon: faTrashAlt,
          onClick: () => {
            const rows: BudgetTable.SubAccountRow[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent({
              payload: { rows, columns: params.columns },
              type: "rowDelete"
            });
          }
        },
        {
          tooltip: "Group",
          icon: faSigma,
          disabled: true,
          text: "Group"
        },
        {
          tooltip: "Mark Up",
          icon: faPercentage,
          disabled: true,
          text: "Mark Up"
        },
        {
          text: "Columns",
          icon: faLineColumns,
          tooltip: "Toggle Visibility",
          wrap: (children: ReactNode) => {
            return (
              <FieldsDropdown
                fields={map(params.columns, (col: Table.Column<BudgetTable.SubAccountRow, Model.SubAccount>) => ({
                  id: col.field as string,
                  label: col.headerName as string,
                  defaultChecked: true
                }))}
                onChange={(change: FieldCheck) => {
                  const tableRefObj = props.tableRef.current;
                  if (!isNil(tableRefObj)) {
                    tableRefObj.setColumnVisibility({ field: change.id, visible: change.checked });
                  }
                }}
              >
                {children}
              </FieldsDropdown>
            );
          }
        },
        {
          text: "Export CSV",
          icon: faFileCsv,
          tooltip: "Export as CSV",
          wrap: (children: ReactNode) => {
            return (
              <FieldsDropdown
                fields={map(params.columns, (col: Table.Column<BudgetTable.SubAccountRow, Model.SubAccount>) => ({
                  id: col.field as string,
                  label: col.headerName as string,
                  defaultChecked: true
                }))}
                buttons={[
                  {
                    onClick: (checks: FieldCheck[]) => {
                      const tableRefObj = props.tableRef.current;
                      const fields = map(
                        filter(checks, (field: FieldCheck) => field.checked === true),
                        (field: FieldCheck) => field.id
                      );
                      if (fields.length !== 0 && !isNil(tableRefObj)) {
                        const csvData = tableRefObj.getCSVData(fields);
                        downloadAsCsvFile(exportFileName, csvData);
                      }
                    },
                    text: "Download",
                    className: "btn--primary"
                  }
                ]}
              >
                {children}
              </FieldsDropdown>
            );
          }
        },
        ...(!isNil(props.actions) ? (Array.isArray(props.actions) ? props.actions : props.actions(params)) : [])
      ]}
      columns={[
        {
          field: "identifier",
          columnType: "number",
          headerName: identifierFieldHeader,
          width: 90,
          cellRendererParams: { className: "subaccount-identifier" },
          footer: { value: tableFooterIdentifierValue, colSpan: (params: ColSpanParams) => 2 },
          budget: { value: budgetFooterIdentifierValue, colSpan: (params: ColSpanParams) => 2 },
          index: 0
        },
        {
          field: "description",
          headerName: `${categoryName} Description`,
          // flex: 100,
          flex: 1,
          columnType: "longText",
          index: 1,
          colSpan: (params: ColSpanParams) => {
            const row: BudgetTable.SubAccountRow = params.data;
            if (!isNil(params.data.meta) && !isNil(params.data.meta.children)) {
              return !isNil(row.meta.children) && row.meta.children.length !== 0 ? 7 : 1;
            }
            return 1;
          }
        },
        {
          field: "quantity",
          headerName: "Qty",
          width: 60,
          isCalculating: true,
          valueSetter: integerValueSetter<BudgetTable.SubAccountRow>("quantity"),
          columnType: "number",
          // If the plurality of the quantity changes, we need to refresh the refresh
          // the unit column to change the plurality of the tag in the cell.
          refreshColumns: (change: Table.CellChange<BudgetTable.SubAccountRow, Model.SubAccount>) => {
            // This shouldn't trigger the callback, but just to be sure.
            if (change.newValue === null && change.oldValue === null) {
              return [];
            } else if (
              change.newValue === null ||
              change.oldValue === null ||
              (change.newValue > 1 && !(change.oldValue > 1)) ||
              (change.newValue <= 1 && !(change.oldValue <= 1))
            ) {
              return ["unit"];
            } else {
              return [];
            }
          }
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: "cell--centered",
          cellRenderer: "SubAccountUnitCell",
          width: 100,
          cellEditor: "SubAccountUnitCellEditor",
          columnType: "singleSelect",
          getHttpValue: (value: Model.Tag | null): number | null => (!isNil(value) ? value.id : null),
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: BudgetTable.SubAccountRow) => {
            const unit = getKeyValue<BudgetTable.SubAccountRow, keyof BudgetTable.SubAccountRow>("unit")(row);
            if (isNil(unit)) {
              return "";
            }
            return unit.name;
          },
          processCellFromClipboard: (name: string) => {
            if (name.trim() === "") {
              return null;
            } else {
              const unit = find(subAccountUnits, { title: name });
              if (!isNil(unit)) {
                return unit;
              }
              return null;
            }
          }
        },
        {
          field: "multiplier",
          headerName: "X",
          width: 50,
          isCalculating: true,
          valueSetter: floatValueSetter<BudgetTable.SubAccountRow>("multiplier"),
          columnType: "number"
        },
        {
          field: "rate",
          headerName: "Rate",
          width: 100,
          isCalculating: true,
          valueFormatter: agCurrencyValueFormatter,
          valueSetter: floatValueSetter<BudgetTable.SubAccountRow>("rate"),
          columnType: "currency"
        },
        {
          field: "fringes",
          headerName: "Fringes",
          isCalculating: true,
          cellClass: classNames("cell--centered"),
          cellRenderer: "FringesCell",
          headerComponentParams: {
            onEdit: () => onEditFringes()
          },
          width: 200,
          nullValue: [],
          cellEditor: fringesCellEditor,
          cellEditorParams: fringesCellEditorParams,
          columnType: "singleSelect",
          getRowValue: (m: Model.SubAccount): Model.Fringe[] => getModelsByIds(fringes, m.fringes),
          getModelValue: (row: BudgetTable.SubAccountRow): number[] => map(row.fringes, (f: Model.Fringe) => f.id),
          processCellFromClipboard: (value: string) => {
            // NOTE: When pasting from the clipboard, the values will be a comma-separated
            // list of Fringe Names (assuming a rational user).  Currently, Fringe Names are
            // enforced to be unique, so we can map the Name back to the ID.  However, this might
            // not always be the case, in which case this logic breaks down.
            const names = value.split(",");
            const fs: Model.Fringe[] = filter(
              map(names, (name: string) => inferModelFromName<Model.Fringe>(fringes, name)),
              (f: Model.Fringe | null) => f !== null
            ) as Model.Fringe[];
            return map(fs, (f: Model.Fringe) => f.id);
          },
          processCellForClipboard: (row: BudgetTable.SubAccountRow) => {
            return map(row.fringes, (fringe: Model.Fringe) => fringe.name).join(", ");
          },
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          }
        },
        ...props.columns
      ]}
    />
  );
};

export default GenericSubAccountsTable;
