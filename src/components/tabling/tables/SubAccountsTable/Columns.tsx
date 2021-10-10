import { findIndex, isNil, map, filter, includes } from "lodash";
import { Column } from "@ag-grid-community/core";

import { tabling, budgeting } from "lib";
import { Icon } from "components";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type PDFM = Model.PdfSubAccount;

const Columns: Table.Column<R, M, any, PDFM>[] = [
  budgeting.columns.IdentifierColumn<R, M, PDFM>({
    field: "identifier",
    pdfHeaderName: "Acct #",
    pdfWidth: 0.1,
    pdfCellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  }),
  tabling.columns.BodyColumn<R, M, string | null, PDFM>({
    field: "description",
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    index: 1,
    suppressSizeToFit: false,
    cellRenderer: "BodyCell",
    pdfHeaderName: "Category Description",
    pdfWidth: 0.75,
    pdfFooter: { value: "Grand Total" },
    pdfValueGetter: (r: Table.BodyRow<Tables.SubAccountRowData>) => {
      if (tabling.typeguards.isGroupRow(r)) {
        return r.groupData.name;
      }
      return r.data.description || "";
    },
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
  tabling.columns.SelectColumn({
    field: "contact",
    headerName: "Contact",
    cellRenderer: { data: "ContactCell" },
    cellEditor: "ContactEditor",
    columnType: "contact",
    index: 2,
    width: 120,
    pdfWidth: 0.1,
    requiresAuthentication: true
  }),
  tabling.columns.BodyColumn<R, M, number, PDFM>({
    field: "quantity",
    headerName: "Qty",
    pdfWidth: 0.1,
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
  tabling.columns.TagSelectColumn({
    field: "unit",
    headerName: "Unit",
    cellRenderer: { data: "SubAccountUnitCell" },
    cellEditor: "SubAccountUnitEditor",
    width: 100,
    pdfWidth: 0.1
  }),
  tabling.columns.BodyColumn<R, M, number | null, PDFM>({
    field: "multiplier",
    headerName: "X",
    width: 60,
    pdfWidth: 0.1,
    valueSetter: tabling.valueSetters.floatValueSetter<R>("multiplier"),
    columnType: "number"
  }),
  tabling.columns.BodyColumn<R, M, number | null, PDFM>({
    field: "rate",
    headerName: "Rate",
    width: 100,
    pdfWidth: 0.1,
    valueFormatter: tabling.formatters.currencyValueFormatter,
    valueSetter: tabling.valueSetters.floatValueSetter<R>("rate"),
    columnType: "currency"
  }),
  tabling.columns.SelectColumn<R, M, number[], PDFM>({
    field: "fringes",
    headerName: "Fringes",
    cellRenderer: { data: "FringesCell" },
    width: 140,
    nullValue: [],
    includeInPdf: false
  }),
  budgeting.columns.EstimatedColumn<R, M, PDFM>({
    colId: "estimated",
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === "" ? "0.00" : tabling.formatters.currencyValueFormatter(params),
    pdfValueGetter: budgeting.valueGetters.estimatedValueGetter,
    pdfWidth: 0.1
  }),
  budgeting.columns.ActualColumn<R, M, PDFM>({ includeInPdf: false, field: "actual" }),
  budgeting.columns.VarianceColumn<R, M, PDFM>({ includeInPdf: false, colId: "variance" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "nominal_value" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "markup_contribution" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "fringe_contribution" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "accumulated_fringe_contribution" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "accumulated_markup_contribution" })
];

export default Columns;
