import { findIndex, isNil, map, filter, includes, reduce } from "lodash";
import { ValueGetterParams, Column } from "@ag-grid-community/core";

import { tabling } from "lib";
import { Icon } from "components";
import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

const Columns: Table.Column<R, M>[] = [
  budgetFramework.columnObjs.IdentifierColumn<R, M>({
    field: "identifier",
    headerName: "" // Will be populated by Table.
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "description",
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    index: 1,
    getMarkupValue: "description",
    suppressSizeToFit: false,
    cellRenderer: "BodyCell",
    cellRendererParams: {
      icon: (row: Table.Row<R, M>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    },
    colSpan: (params: Table.ColSpanParams<R, M>) => {
      const row: Table.Row<R, M> = params.data;
      if (tabling.typeguards.isModelRow(row)) {
        if (!isNil(row.children) && row.children.length !== 0) {
          const agColumns: Column[] | undefined = params.columnApi?.getAllDisplayedColumns();
          if (!isNil(agColumns)) {
            const originalCalculatedColumns = filter(
              map(
                filter(params.columns, (col: Table.Column<R, M>) => col.tableColumnType === "calculated"),
                (col: Table.Column<R, M>) => col.field || col.colId
              ),
              (f: keyof R | string | undefined) => !isNil(f)
            ) as string[];
            const indexOfDescriptionColumn = findIndex(agColumns, (col: Column) => col.getColId() === "description");
            const indexOfFirstCalculatedColumn = findIndex(agColumns, (col: Column) =>
              includes(originalCalculatedColumns, col.getColId())
            );
            return indexOfFirstCalculatedColumn - indexOfDescriptionColumn;
          }
        }
      }
      return 1;
    }
  }),
  framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
    field: "contact",
    headerName: "Contact",
    cellRenderer: { data: "ContactCell" },
    cellEditor: "ContactEditor",
    columnType: "contact",
    index: 2,
    width: 120,
    requiresAuthentication: true,
    models: [], // Will be populated by Table.
    modelClipboardValue: (m: Model.Contact) => m.full_name,
    processCellFromClipboard: (name: string): Model.Contact | null => null // Will be populated by Table.
  }),
  framework.columnObjs.BodyColumn<R, M, number>({
    field: "quantity",
    headerName: "Qty",
    width: 60,
    valueSetter: tabling.valueSetters.integerValueSetter<R>("quantity"),
    columnType: "number",
    // If the plurality of the quantity changes, we need to refresh the refresh
    // the unit column to change the plurality of the tag in the cell.
    refreshColumns: (change: Table.CellChange<R, number>) => {
      if (isNil(change.newValue) && isNil(change.oldValue)) {
        return [];
      } else if (
        isNil(change.newValue) ||
        isNil(change.oldValue) ||
        (change.newValue > 1 && !(change.oldValue > 1)) ||
        (change.newValue <= 1 && !(change.oldValue <= 1))
      ) {
        return ["unit"];
      } else {
        return [];
      }
    }
  }),
  framework.columnObjs.TagSelectColumn<R, M>({
    field: "unit",
    headerName: "Unit",
    cellRenderer: { data: "SubAccountUnitCell" },
    cellEditor: "SubAccountUnitEditor",
    models: [], // Will be populated by Table.
    width: 100
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "multiplier",
    headerName: "X",
    width: 60,
    valueSetter: tabling.valueSetters.floatValueSetter<R>("multiplier"),
    columnType: "number"
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "rate",
    headerName: "Rate",
    tableColumnType: "body",
    width: 100,
    valueFormatter: tabling.formatters.agCurrencyValueFormatter,
    valueSetter: tabling.valueSetters.floatValueSetter<R>("rate"),
    columnType: "currency"
  }),
  framework.columnObjs.SelectColumn<R, M>({
    field: "fringes",
    headerName: "Fringes",
    cellRenderer: { data: "FringesCell" },
    width: 140,
    nullValue: [],
    processCellForClipboard: (row: R) => "" // Will be populated by Table.
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "estimated",
    headerName: "Estimated",
    getGroupValue: (rows: Table.EditableRow<R, M>[]) => {
      return reduce(
        rows,
        (curr: number, r: Table.EditableRow<R, M>) => curr + r.data.estimated + r.data.fringe_contribution,
        0.0
      );
    }
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "actual",
    headerName: "Actual",
    getGroupValue: (rows: Table.EditableRow<R, M>[]) => {
      return reduce(rows, (curr: number, r: Table.EditableRow<R, M>) => curr + r.data.actual, 0.0);
    }
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    colId: "variance",
    headerName: "Variance",
    valueGetter: (params: ValueGetterParams) => {
      if (!isNil(params.node)) {
        const row: Table.Row<R, M> = params.node.data;
        return row.data.estimated + row.data.fringe_contribution - row.data.actual;
      }
      return 0.0;
    }
  })
];

export default Columns;
