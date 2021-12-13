import { isNil, reduce } from "lodash";

import { tabling, util } from "lib";
import { columns } from "../../generic";

type R = Tables.ActualRowData;
type M = Model.Actual;

const Columns: Table.Column<R, M>[] = [
  columns.BodyColumn<R, M>({
    field: "name",
    headerName: "Description",
    minWidth: 200,
    pdfFlexGrow: true,
    flex: 2,
    columnType: "longText",
    pdfFooter: { value: "Grand Total" }
  }),
  columns.SelectColumn({
    field: "contact",
    headerName: "Contact",
    pdfWidth: 0.12,
    width: 120,
    minWidth: 120,
    cellRenderer: { data: "ContactCell" },
    cellEditor: "ContactEditor",
    columnType: "contact"
  }),
  columns.BodyColumn<R, M>({
    field: "date",
    headerName: "Date",
    pdfWidth: 0.08,
    width: 100,
    minWidth: 100,
    flex: 1,
    cellEditor: "DateEditor",
    cellEditorPopup: true,
    cellEditorPopupPosition: "below",
    valueFormatter: tabling.formatters.dateValueFormatter,
    valueSetter: tabling.valueSetters.dateTimeValueSetter<R>("date"),
    columnType: "date",
    processCellForCSV: (row: R) => {
      return (!isNil(row.date) && util.dates.toDate(row.date)) || "";
    }
  }),
  columns.TagSelectColumn({
    field: "actual_type",
    headerName: "Type",
    pdfWidth: 0.12,
    cellRenderer: { data: "ActualTypeCell" },
    cellEditor: "ActualTypeEditor",
    width: 140,
    minWidth: 140
  }),
  columns.BodyColumn<R, M>({
    field: "value",
    headerName: "Amount",
    width: 100,
    minWidth: 100,
    pdfWidth: 0.1,
    flex: 1,
    footer: {
      cellStyle: { textAlign: "right" }
    },
    valueFormatter: tabling.formatters.currencyValueFormatter,
    valueSetter: tabling.valueSetters.numericValueSetter<R>("value"),
    columnType: "currency",
    /* We only want to use BodyCell's in the Footer cells because it slows
		   rendering performance down dramatically. */
    cellRenderer: { footer: "BodyCell" },
    pdfFooterValueGetter: (rows: Table.DataRow<R>[]) =>
      reduce(rows, (sum: number, s: Table.DataRow<R>) => sum + (s.data.value || 0), 0)
  }),
  columns.SelectColumn<R, M, Model.SimpleSubAccount | Model.SimpleMarkup | null>({
    field: "owner",
    headerName: "Sub-Account",
    minWidth: 200,
    width: 200,
    pdfWidth: 0.12,
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
    headerName: "PO",
    width: 100,
    minWidth: 100,
    flex: 1,
    columnType: "number",
    tableColumnType: "body",
    pdfWidth: 0.08
  }),
  columns.BodyColumn<R, M>({
    field: "payment_id",
    headerName: "Pay ID",
    width: 80,
    minWidth: 80,
    flex: 1,
    columnType: "number",
    pdfWidth: 0.08
  }),
  columns.BodyColumn<R, M>({
    field: "notes",
    headerName: "Notes",
    width: 100,
    minWidth: 100,
    flex: 1,
    columnType: "longText",
    includeInPdf: false
  })
];

export default Columns;
