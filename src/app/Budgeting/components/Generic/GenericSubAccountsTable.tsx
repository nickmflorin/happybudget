import { useRef, ReactNode } from "react";
import { isNil, includes, find, filter, map } from "lodash";
import classNames from "classnames";

import { faSigma, faPercentage, faTrashAlt, faLineColumns, faFileCsv } from "@fortawesome/pro-solid-svg-icons";

import { ColDef, ColSpanParams, SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { FieldsDropdown } from "components/dropdowns";

import { getKeyValue } from "lib/util";
import { downloadAsCsvFile } from "lib/util/files";
import { inferModelFromName } from "lib/model/util";
import { currencyValueFormatter } from "lib/model/formatters";
import { floatValueSetter, integerValueSetter } from "lib/model/valueSetters";

import BudgetTableComponent from "../BudgetTable";

export interface GenericSubAccountsTableProps<R extends Table.Row, M extends Model.SubAccount, G extends Model.Group>
  extends Omit<BudgetTable.Props<R, M, G, Http.SubAccountPayload>, "groupParams" | "rowCanExpand" | "tableRef"> {
  exportFileName: string;
  categoryName: "Sub Account" | "Detail";
  identifierFieldHeader: "Account" | "Line";
  fringes: Model.Fringe[];
  fringesCellRenderer: "BudgetFringesCell" | "TemplateFringesCell";
  fringesCellEditor: "BudgetFringesCellEditor" | "TemplateFringesCellEditor";
  fringesCellEditorParams: {
    colId: keyof R;
    onAddFringes: () => void;
  };
  tableFooterIdentifierValue: string;
  budgetFooterIdentifierValue?: string;
  subAccountUnits: Model.Tag[];
  onGroupRows: (rows: R[]) => void;
  onDeleteGroup: (group: G) => void;
  onEditGroup: (group: G) => void;
  onRowRemoveFromGroup: (row: R) => void;
  onRowAddToGroup: (group: number, row: R) => void;
  onEditFringes: () => void;
}

const GenericSubAccountsTable = <
  R extends BudgetTable.SubAccountRow,
  M extends Model.SubAccount,
  G extends Model.Group
>({
  /* eslint-disable indent */
  categoryName,
  identifierFieldHeader,
  fringes,
  fringesCellEditor,
  fringesCellRenderer,
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
}: GenericSubAccountsTableProps<R, M, G>): JSX.Element => {
  const tableRef = useRef<BudgetTable.Ref>(null);

  return (
    <BudgetTableComponent<R, M, G, Http.SubAccountPayload>
      tableRef={tableRef}
      isCellEditable={(row: R, colDef: ColDef) => {
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
      rowCanExpand={(row: R) => row.identifier !== null || row.meta.children.length !== 0}
      {...props}
      actions={(params: BudgetTable.MenuActionParams<R>) => [
        {
          tooltip: "Delete",
          icon: faTrashAlt,
          onClick: () => {
            const rows: R[] = params.apis.grid.getSelectedRows();
            props.onRowDelete(map(rows, (row: R) => row.id));
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
                fields={map(params.columns, (col: Table.Column<R>) => ({
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
                fields={map(params.columns, (col: Table.Column<R>) => ({
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
            const row: BudgetTable.TemplateSubAccountRow = params.data;
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
          valueSetter: integerValueSetter<BudgetTable.TemplateSubAccountRow>("quantity"),
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
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: R) => {
            const unit = getKeyValue<R, keyof R>("unit")(row);
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
          valueSetter: floatValueSetter<BudgetTable.TemplateSubAccountRow>("multiplier"),
          type: "number"
        },
        {
          field: "rate",
          headerName: "Rate",
          width: 100,
          valueFormatter: currencyValueFormatter,
          valueSetter: floatValueSetter<BudgetTable.TemplateSubAccountRow>("rate"),
          type: "currency"
        },
        {
          field: "fringes",
          headerName: "Fringes",
          cellClass: classNames("cell--centered"),
          cellRenderer: fringesCellRenderer,
          headerComponentParams: {
            onEdit: () => onEditFringes()
          },
          minWidth: 150,
          nullValue: [],
          cellEditor: fringesCellEditor,
          cellEditorParams: fringesCellEditorParams,
          type: "singleSelect",
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
          processCellForClipboard: (row: R) => {
            const subAccountFringes: Model.Fringe[] = filter(
              map(row.fringes, (id: number) => {
                const fringe: Model.Fringe | undefined = find(fringes, { id });
                if (!isNil(fringe)) {
                  return fringe;
                } else {
                  /* eslint-disable no-console */
                  console.error(
                    `Corrupted Cell Found! Could not convert model value ${id} for field fringes
                    to a name.`
                  );
                  return null;
                }
              }),
              (fringe: Model.Fringe | null) => fringe !== null
            ) as Model.Fringe[];
            return map(subAccountFringes, (fringe: Model.Fringe) => fringe.name).join(", ");
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
