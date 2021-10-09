import { isNil } from "lodash";

import { model, tabling } from "lib";

import { framework } from "components/tabling/generic";

type R = Tables.ActualRowData;
type M = Model.Actual;

const Columns: Table.Column<R, M>[] = [
  framework.columnObjs.SelectColumn<R, M, Model.SimpleSubAccount | Model.SimpleMarkup | null>({
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
  framework.columnObjs.BodyColumn<R, M>({
    field: "description",
    headerName: "Description",
    minWidth: 200,
    flex: 3,
    columnType: "longText"
  }),
  framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
    field: "contact",
    headerName: "Contact",
    width: 120,
    minWidth: 120,
    cellRenderer: { data: "ContactCell" },
    cellEditor: "ContactEditor",
    columnType: "contact",
    modelClipboardValue: (m: Model.Contact) => m.full_name,
    models: [], // Will be populated by table.
    processCellFromClipboard: (name: string): Model.Contact | null => null // Will be populated by table.
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "purchase_order",
    headerName: "PO",
    width: 100,
    minWidth: 100,
    flex: 1,
    columnType: "number",
    tableColumnType: "body"
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "date",
    headerName: "Date",
    width: 100,
    minWidth: 100,
    flex: 1,
    cellEditor: "DateEditor",
    valueFormatter: tabling.formatters.dateValueFormatter,
    valueSetter: tabling.valueSetters.dateTimeValueSetter<R>("date"),
    columnType: "date"
  }),
  framework.columnObjs.ChoiceSelectColumn<R, M, Model.PaymentMethod>({
    field: "payment_method",
    headerName: "Pay Method",
    width: 140,
    minWidth: 140,
    cellRenderer: { data: "PaymentMethodCell" },
    cellEditor: "PaymentMethodEditor",
    models: model.models.PaymentMethods
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "payment_id",
    headerName: "Pay ID",
    width: 80,
    minWidth: 80,
    flex: 1,
    columnType: "number"
  }),
  framework.columnObjs.BodyColumn<R, M>({
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
