import { isNil } from "lodash";

import { tabling } from "lib";

type R = Tables.ActualRowData;
type M = Model.Actual;

const Columns: Table.Column<R, M>[] = [
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
    cellRenderer: { data: "OwnerCell" },
    cellEditor: "OwnerTreeEditor"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "name",
    headerName: "Name",
    minWidth: 200,
    flex: 3,
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
    field: "purchase_order",
    headerName: "PO",
    width: 100,
    minWidth: 100,
    flex: 1,
    columnType: "number",
    tableColumnType: "body"
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
    field: "payment_id",
    headerName: "Pay ID",
    width: 80,
    minWidth: 80,
    flex: 1,
    columnType: "number"
  }),
  tabling.columns.AttachmentsColumn({
    field: "attachments"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "value",
    headerName: "Amount",
    width: 100,
    minWidth: 100,
    flex: 1,
    valueFormatter: tabling.formatters.currencyValueFormatter,
    valueSetter: tabling.valueSetters.floatValueSetter<R>("value"),
    cellRenderer: "BodyCell",
    columnType: "currency"
  })
];

export default Columns;
