import { findIndex, isNil, map, includes } from "lodash";
import { Column } from "@ag-grid-community/core";

import { tabling, budgeting } from "lib";
import { Icon } from "components";
import { columns } from "../../generic";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

const Columns: Table.Column<R, M>[] = [
  columns.IdentifierColumn<"subaccount", R, M>({
    field: "identifier",
    markupField: "identifier",
    pdfHeaderName: "Acct #",
    pdfWidth: 0.08,
    pdfCellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } },
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder", "markup"], r)
  }),
  columns.BodyColumn<R, M, string | null>({
    field: "description",
    nullValue: null,
    markupField: "description",
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder", "markup"], r),
    minWidth: 200,
    flex: 100,
    pdfFlexGrow: true,
    dataType: "longText",
    index: 1,
    suppressSizeToFit: false,
    /* The custom cell renderer here is only needed to include the Markup icon,
       which is annoying because it is only needed for those rows and slows down
       rendering performance. */
    cellRenderer: "BodyCell",
    pdfHeaderName: "Description",
    pdfFooter: { value: "Grand Total" },
    pdfValueGetter: (r: Table.BodyRow<Tables.SubAccountRowData>) => {
      if (tabling.typeguards.isGroupRow(r)) {
        return r.groupData.name;
      }
      return r.data.description || "";
    },
    cellRendererParams: {
      /* For the MarkupRow, we need to remove the flex styling so we can justify
         the Icon at the right end of the cell. */
      innerCellStyle: (row: Table.BodyRow<R>) => (tabling.typeguards.isMarkupRow(row) ? { display: "block" } : {}),
      icon: (row: Table.BodyRow<R>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    },
    colSpan: (params: Table.ColSpanParams<R, M>) => {
      const row: Table.BodyRow<R> = params.data;
      if ((tabling.typeguards.isModelRow(row) && row.children.length !== 0) || tabling.typeguards.isMarkupRow(row)) {
        const agColumns: Column[] | undefined = params.columnApi?.getAllDisplayedColumns();
        if (!isNil(agColumns)) {
          const originalCalculatedColumns = map(
            tabling.columns.filterCalculatedColumns(params.columns),
            (col: Table.CalculatedColumn<R, M>) => col.field
          );
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
  columns.AttachmentsColumn({
    field: "attachments",
    defaultHidden: true,
    includeInPdf: false,
    /* Note: This also gets triggered for the PDF model form, but that is okay
       because the PDF model form has a domain property as well. */
    isApplicableForModel: (m: Model.SubAccount) => m.domain === "budget",
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder"], r)
  }),
  columns.SelectColumn({
    field: "contact",
    nullValue: null,
    headerName: "Contact",
    cellRenderer: { data: "ContactCell" },
    cellEditor: "ContactEditor",
    dataType: "contact",
    index: 2,
    width: 120,
    pdfWidth: 0.12,
    requiresAuthentication: true,
    /* Note: This also gets triggered for the PDF model form, but that is okay
       because the PDF model form has a domain property as well. */
    isApplicableForModel: (m: Model.SubAccount) => m.domain === "budget",
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder"], r)
  }),
  columns.BodyColumn<R, M, number | null>({
    field: "quantity",
    nullValue: null,
    headerName: "Qty",
    pdfWidth: 0.05,
    width: 60,
    valueSetter: tabling.valueSetters.numericValueSetter("quantity"),
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder"], r),
    dataType: "number",
    /* If the plurality of the quantity changes, we need to refresh the refresh
       the unit column to change the plurality of the tag in the cell. */
    refreshColumns: (change: Table.CellChange<number | null>) => {
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
  columns.TagSelectColumn({
    field: "unit",
    nullValue: null,
    headerName: "Unit",
    cellRenderer: { data: "SubAccountUnitCell" },
    cellEditor: "SubAccountUnitEditor",
    width: 100,
    pdfWidth: 0.07,
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder"], r)
  }),
  columns.BodyColumn<R, M, number | null>({
    field: "multiplier",
    nullValue: null,
    headerName: "X",
    width: 60,
    pdfWidth: 0.05,
    valueSetter: tabling.valueSetters.numericValueSetter("multiplier"),
    dataType: "number",
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder"], r)
  }),
  columns.BodyColumn<R, M, number | null>({
    field: "rate",
    nullValue: null,
    headerName: "Rate",
    width: 100,
    pdfWidth: 0.05,
    valueFormatter: tabling.formatters.currencyValueFormatter(v =>
      console.error(`Could not parse currency value ${v} for field 'rate'.`)
    ),
    valueSetter: tabling.valueSetters.numericValueSetter("rate"),
    dataType: "currency",
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder"], r)
  }),
  columns.SelectColumn<R, M, number[]>({
    field: "fringes",
    headerName: "Fringes",
    cellRenderer: { data: "FringesCell" },
    width: 140,
    nullValue: [],
    includeInPdf: false,
    isApplicableForRowType: (r: Table.RowType) => includes(["model", "placeholder"], r)
  }),
  columns.EstimatedColumn<R, M>({
    field: "estimated",
    isRead: false,
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === ""
        ? "0.00"
        : tabling.formatters.currencyValueFormatter(v =>
            console.error(`Could not parse currency value ${v} for field 'estimated'.`)
          )(params),
    pdfValueGetter: budgeting.valueGetters.estimatedValueGetter,
    pdfWidth: 0.12
  }),
  columns.ActualColumn<R, M>({
    field: "actual",
    markupField: "actual",
    isRead: true,
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === ""
        ? "0.00"
        : tabling.formatters.currencyValueFormatter(v =>
            console.error(`Could not parse currency value ${v} for field 'actual'.`)
          )(params),
    pdfValueGetter: budgeting.valueGetters.actualValueGetter,
    pdfWidth: 0.12,
    /* Note: This also gets triggered for the PDF model form, but that is okay
       because the PDF model form has a domain property as well. */
    isApplicableForModel: (m: Model.SubAccount) => m.domain === "budget"
  }),
  columns.VarianceColumn<R, M>({
    field: "variance",
    isRead: false,
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === ""
        ? "0.00"
        : tabling.formatters.currencyValueFormatter(v =>
            console.error(`Could not parse currency value ${v} for field 'variance'.`)
          )(params),
    pdfValueGetter: budgeting.valueGetters.varianceValueGetter,
    pdfWidth: 0.12,
    /* Note: This also gets triggered for the PDF model form, but that is okay
       because the PDF model form has a domain property as well. */
    isApplicableForModel: (m: Model.SubAccount) => m.domain === "budget"
  }),
  columns.FakeColumn({ field: "nominal_value", nullValue: 0.0 }),
  columns.FakeColumn({ field: "markup_contribution", nullValue: 0.0 }),
  columns.FakeColumn({ field: "fringe_contribution", nullValue: 0.0 }),
  columns.FakeColumn({ field: "accumulated_fringe_contribution", nullValue: 0.0 }),
  columns.FakeColumn({ field: "accumulated_markup_contribution", nullValue: 0.0 })
];

export default Columns;
