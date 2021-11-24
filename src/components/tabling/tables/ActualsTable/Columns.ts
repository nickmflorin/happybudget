import { isNil } from "lodash";

import { tabling } from "lib";

type R = Tables.ActualRowData;
type M = Model.Actual;

const Columns: Table.Column<R, M>[] = [
  tabling.columns.BodyColumn<R, M>({
    field: "name",
    headerName: "Name",
    minWidth: 200,
    flex: 2,
    columnType: "longText"
  }),
  tabling.columns.SelectColumn({
    field: "contact",
    headerName: "Contact",
    width: 120,
    minWidth: 120,
    cellRenderer: { data: "ContactCell" },
    cellEditor: "ContactEditor",
    columnType: "contact"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "date",
    headerName: "Date",
    width: 100,
    minWidth: 100,
    flex: 1,
    cellEditor: "DateEditor",
    cellEditorPopup: true,
    cellEditorPopupPosition: "below",
    valueFormatter: tabling.formatters.dateValueFormatter,
    valueSetter: tabling.valueSetters.dateTimeValueSetter<R>("date"),
    columnType: "date"
  }),
  tabling.columns.TagSelectColumn({
    field: "actual_type",
    headerName: "Type",
    cellRenderer: { data: "ActualTypeCell" },
    cellEditor: "ActualTypeEditor",
    width: 140,
    minWidth: 140
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "value",
    headerName: "Amount",
    width: 100,
    minWidth: 100,
    flex: 1,
    valueFormatter: tabling.formatters.currencyValueFormatter,
    valueSetter: tabling.valueSetters.floatValueSetter<R>("value"),
    processCellFromClipboard: (value: string) => {
      if (!isNaN(parseFloat(value))) {
        return parseFloat(value);
      }
      return null;
    },
    columnType: "currency",
    // We only want to use BodyCell's in the Footer cells because it slows rendering
    // performance down dramatically.
    cellRenderer: { footer: "BodyCell" }
  }),
  tabling.columns.SelectColumn<R, M, Model.SimpleSubAccount | Model.SimpleMarkup | null>({
    field: "owner",
    headerName: "Sub-Account",
    minWidth: 200,
    width: 200,
    getHttpValue: (
      value: Model.SimpleSubAccount | Model.SimpleMarkup | null
    ): Model.GenericHttpModel<"markup"> | Model.GenericHttpModel<"subaccount"> | null => {
      if (!isNil(value)) {
        return { id: value.id, type: value.type };
      }
      return value;
    },
    processCellForClipboard: (row: R) => {
      if (!isNil(row.owner)) {
        return row.owner.identifier || "";
      }
      return "";
    },
    cellRenderer: { data: "ActualOwnerCell" },
    cellEditor: "ActualOwnerEditor"
  }),
  tabling.columns.AttachmentsColumn({
    field: "attachments",
    width: 140,
    minWidth: 140
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "purchase_order",
    headerName: "PO",
    width: 100,
    minWidth: 100,
    flex: 1,
    columnType: "number",
    tableColumnType: "body"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "payment_id",
    headerName: "Pay ID",
    width: 80,
    minWidth: 80,
    flex: 1,
    columnType: "number"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "notes",
    headerName: "Notes",
    width: 100,
    minWidth: 100,
    flex: 1,
    columnType: "longText"
  })
];

export default Columns;
