import { isNil, reduce, filter } from "lodash";

import { tabling, util } from "lib";
import { columns } from "../../generic";

type R = Tables.ActualRowData;
type M = Model.Actual;

const Columns: Table.Column<R, M>[] = [
  columns.BodyColumn<R, M>({
    field: "name",
    nullValue: null,
    headerName: "Description",
    minWidth: 200,
    pdfFlexGrow: true,
    flex: 2,
    dataType: "longText",
    pdfFooter: { value: "Grand Total" }
  }),
  columns.SelectColumn({
    field: "contact",
    nullValue: null,
    headerName: "Contact",
    pdfWidth: 0.1,
    width: 120,
    minWidth: 120,
    cellRenderer: { data: "ContactCell" },
    cellEditor: "ContactEditor",
    dataType: "contact"
  }),
  columns.BodyColumn<R, M, string | null>({
    field: "date",
    nullValue: null,
    headerName: "Date",
    pdfWidth: 0.1,
    width: 100,
    minWidth: 100,
    flex: 1,
    cellEditor: "DateEditor",
    cellEditorPopup: true,
    cellEditorPopupPosition: "below",
    valueFormatter: tabling.columns.dateValueFormatter((v: string) =>
      console.error(`Could not parse date value ${v} for field 'date'.`)
    ),
    valueSetter: tabling.columns.dateTimeValueSetter("date"),
    pdfFormatter: (params: Table.NativeFormatterParams<string>) =>
      isNil(params) || params === "" ? "" : tabling.columns.dateValueFormatter(params),
    dataType: "date",
    processCellForCSV: (row: R) => {
      return (!isNil(row.date) && util.dates.toDate(row.date)) || "";
    }
  }),
  columns.TagSelectColumn({
    field: "actual_type",
    nullValue: null,
    headerName: "Type",
    pdfWidth: 0.1,
    cellRenderer: { data: "ActualTypeCell" },
    cellEditor: "ActualTypeEditor",
    width: 140,
    minWidth: 140
  }),
  columns.BodyColumn<R, M, number | null>({
    field: "value",
    nullValue: null,
    headerName: "Amount",
    width: 100,
    minWidth: 100,
    pdfWidth: 0.1,
    flex: 1,
    footer: {
      cellStyle: { textAlign: "right" }
    },
    pdfFormatter: (params: Table.NativeFormatterParams<number | null>) =>
      isNil(params)
        ? "0.0"
        : tabling.columns.currencyValueFormatter((v: string) =>
            console.error(`Could not parse currency value ${v} for PDF field 'value'.`)
          )(params),
    valueFormatter: tabling.columns.currencyValueFormatter((v: string) =>
      console.error(`Could not parse currency value ${v} for field 'value'.`)
    ),
    valueSetter: tabling.columns.numericValueSetter("value"),
    dataType: "currency",
    /* We only want to use BodyCell's in the Footer cells because it slows
		   rendering performance down dramatically. */
    cellRenderer: { footer: "BodyCell" },
    pdfFooterValueGetter: (rows: Table.BodyRow<R>[]) =>
      reduce(
        filter(rows, (r: Table.BodyRow<R>) => tabling.rows.isModelRow(r)) as Table.ModelRow<R>[],
        (sum: number, s: Table.ModelRow<R>) => sum + (s.data.value || 0),
        0
      )
  }),
  columns.SelectColumn<R, M, Model.SimpleSubAccount | Model.SimpleMarkup | null>({
    field: "owner",
    nullValue: null,
    headerName: "Sub-Account",
    minWidth: 200,
    width: 200,
    pdfWidth: 0.1,
    getHttpValue: (
      value: Model.SimpleSubAccount | Model.SimpleMarkup | null
    ): Model.GenericHttpModel<"markup"> | Model.GenericHttpModel<"subaccount"> | null => {
      if (!isNil(value)) {
        return { id: value.id, type: value.type };
      }
      return value;
    },
    processCellForCSV: (row: R) =>
      !isNil(row.owner) ? util.conditionalJoinString(row.owner.identifier, row.owner.description) : "",
    processCellForClipboard: (row: R) => (!isNil(row.owner) ? `internal-${row.owner.type}-${row.owner.id}` : ""),
    cellRenderer: { data: "ActualOwnerCell" },
    cellEditor: "ActualOwnerEditor"
  }),
  columns.AttachmentsColumn({
    field: "attachments",
    width: 140,
    minWidth: 140,
    canBeExported: false,
    includeInPdf: false
  }),
  columns.BodyColumn<R, M>({
    field: "purchase_order",
    nullValue: null,
    headerName: "PO",
    width: 100,
    minWidth: 100,
    flex: 1,
    dataType: "number",
    pdfWidth: 0.08
  }),
  columns.BodyColumn<R, M>({
    field: "payment_id",
    nullValue: null,
    headerName: "Pay ID",
    width: 80,
    minWidth: 80,
    flex: 1,
    dataType: "number",
    pdfWidth: 0.08
  }),
  columns.BodyColumn<R, M>({
    field: "notes",
    nullValue: null,
    headerName: "Notes",
    width: 100,
    minWidth: 100,
    pdfWidth: 0.13,
    flex: 1,
    dataType: "longText"
  })
];

export default Columns;
