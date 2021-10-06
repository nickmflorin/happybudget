import { findIndex, isNil, map, filter, includes } from "lodash";
import { Column } from "@ag-grid-community/core";

import { tabling } from "lib";
import { Icon } from "components";
import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

const Columns: Table.Column<R, M>[] = [
  budgetFramework.columnObjs.IdentifierColumn<R, M>({
    headerName: "" // Will be populated by Table.
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "description",
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    index: 1,
    suppressSizeToFit: false,
    cellRenderer: "BodyCell",
    cellRendererParams: {
      icon: (row: Table.BodyRow<R>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    },
    colSpan: (params: Table.ColSpanParams<R, M>) => {
      const row: Table.BodyRow<R> = params.data;
      if ((tabling.typeguards.isModelRow(row) && row.children.length !== 0) || tabling.typeguards.isMarkupRow(row)) {
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
    valueFormatter: tabling.formatters.currencyValueFormatter,
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
  budgetFramework.columnObjs.EstimatedColumn<R, M>({}),
  budgetFramework.columnObjs.ActualColumn<R, M>({}),
  budgetFramework.columnObjs.VarianceColumn<R, M>({}),
  framework.columnObjs.FakeColumn<R, M>({ field: "nominal_value" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "markup_contribution" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "fringe_contribution" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "accumulated_fringe_contribution" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "accumulated_markup_contribution" })
];

export default Columns;
