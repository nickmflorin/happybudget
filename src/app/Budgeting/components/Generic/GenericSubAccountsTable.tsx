import { useRef, ReactNode } from "react";
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
    "groupParams" | "rowCanExpand" | "tableRef" | "manager"
  > {
  exportFileName: string;
  categoryName: "Sub Account" | "Detail";
  identifierFieldHeader: "Account" | "Line";
  fringes: Model.Fringe[];
  fringesCellEditor:
    | "BudgetAccountFringesCellEditor"
    | "TemplateAccountFringesCellEditor"
    | "BudgetSubAccountFringesCellEditor"
    | "TemplateSubAccountFringesCellEditor";
  fringesCellEditorParams: {
    colId: keyof BudgetTable.SubAccountRow;
    onAddFringes: () => void;
  };
  tableFooterIdentifierValue: string;
  budgetFooterIdentifierValue?: string;
  subAccountUnits: Model.Tag[];
  onGroupRows: (rows: BudgetTable.SubAccountRow[]) => void;
  onDeleteGroup: (group: Model.Group) => void;
  onEditGroup: (group: Model.Group) => void;
  onRowRemoveFromGroup: (row: BudgetTable.SubAccountRow) => void;
  onRowAddToGroup: (group: number, row: BudgetTable.SubAccountRow) => void;
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
  onDeleteGroup,
  onEditGroup,
  onRowRemoveFromGroup,
  onRowAddToGroup,
  onEditFringes,
  ...props
}: GenericSubAccountsTableProps): JSX.Element => {
  const tableRef = useRef<BudgetTable.Ref>(null);

  return (
    <BudgetTableComponent<BudgetTable.SubAccountRow, Model.SubAccount, Http.SubAccountPayload>
      tableRef={tableRef}
      isCellEditable={(row: BudgetTable.SubAccountRow, colDef: ColDef) => {
        if (includes(["identifier", "description", "name"], colDef.field)) {
          return true;
        } else {
          return row.meta.children.length === 0;
        }
      }}
      groupParams={{
        onDeleteGroup,
        onRowRemoveFromGroup,
        onGroupRows,
        onEditGroup,
        onRowAddToGroup
      }}
      rowCanExpand={(row: BudgetTable.SubAccountRow) => !isNil(row.identifier) || row.meta.children.length !== 0}
      getModelChildren={(model: Model.SubAccount) => model.subaccounts}
      {...props}
      actions={(params: BudgetTable.MenuActionParams<BudgetTable.SubAccountRow, Model.SubAccount>) => [
        {
          tooltip: "Delete",
          icon: faTrashAlt,
          onClick: () => {
            const rows: BudgetTable.SubAccountRow[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent({
              payload: map(rows, (row: BudgetTable.SubAccountRow) => row.id),
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
                  const tableRefObj = tableRef.current;
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
                      const tableRefObj = tableRef.current;
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
          type: "number",
          headerName: identifierFieldHeader,
          width: 90,
          cellRendererParams: { className: "subaccount-identifier" },
          footer: { value: tableFooterIdentifierValue, colSpan: (params: ColSpanParams) => 2 },
          budget: { value: budgetFooterIdentifierValue, colSpan: (params: ColSpanParams) => 2 }
        },
        {
          field: "description",
          headerName: `${categoryName} Description`,
          flex: 100,
          type: "longText",
          colSpan: (params: ColSpanParams) => {
            const row: BudgetTable.SubAccountRow = params.data;
            if (!isNil(params.data.meta) && !isNil(params.data.meta.children)) {
              return row.meta.children.length !== 0 ? 7 : 1;
            }
            return 1;
          }
        },
        {
          field: "name",
          headerName: "Contact",
          width: 120,
          type: "contact"
        },
        {
          field: "quantity",
          headerName: "Qty",
          width: 60,
          valueSetter: integerValueSetter<BudgetTable.SubAccountRow>("quantity"),
          type: "number"
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: "cell--centered",
          cellRenderer: "SubAccountUnitCell",
          width: 100,
          cellEditor: "SubAccountUnitCellEditor",
          type: "singleSelect",
          getModelValue: (row: BudgetTable.SubAccountRow): number | null => (!isNil(row.unit) ? row.unit.id : null),
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
          valueSetter: floatValueSetter<BudgetTable.SubAccountRow>("multiplier"),
          type: "number"
        },
        {
          field: "rate",
          headerName: "Rate",
          width: 100,
          valueFormatter: agCurrencyValueFormatter,
          valueSetter: floatValueSetter<BudgetTable.SubAccountRow>("rate"),
          type: "currency"
        },
        {
          field: "fringes",
          headerName: "Fringes",
          cellClass: classNames("cell--centered"),
          cellRenderer: "FringesCell",
          headerComponentParams: {
            onEdit: () => onEditFringes()
          },
          minWidth: 150,
          nullValue: [],
          cellEditor: fringesCellEditor,
          cellEditorParams: fringesCellEditorParams,
          type: "singleSelect",
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
