import { tabling } from "lib";

export const AccountColumns: { [key: string]: PdfTable.Column<Tables.PdfAccountRow, Model.PdfAccount> } = {
  identifier: {
    field: "identifier",
    headerName: "Acct #",
    columnType: "text",
    width: 0.1,
    tableColumnType: "body",
    cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  },
  description: {
    field: "description",
    headerName: "Category Description",
    columnType: "longText",
    width: 0.75,
    tableColumnType: "body",
    footer: {
      value: "Grand Total"
    }
  },
  estimated: {
    field: "estimated",
    headerName: "Estimated",
    tableColumnType: "calculated",
    columnType: "sum",
    formatter: tabling.formatters.currencyValueFormatter,
    width: 0.15
  }
};

export const SubAccountColumns: { [key: string]: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount> } = {
  identifier: {
    field: "identifier",
    columnType: "number",
    headerName: "Acct",
    width: 0.1,
    tableColumnType: "body",
    cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  },
  description: {
    field: "description",
    headerName: "Description",
    columnType: "longText",
    width: 0.3,
    tableColumnType: "body"
  },
  contact: {
    field: "contact",
    headerName: "Contact",
    columnType: "contact",
    width: 0.1,
    tableColumnType: "body"
  },
  quantity: {
    field: "quantity",
    headerName: "Qty",
    columnType: "number",
    width: 0.1,
    tableColumnType: "body"
  },
  unit: {
    field: "unit",
    headerName: "Unit",
    columnType: "singleSelect",
    width: 0.1,
    tableColumnType: "body"
  },
  multiplier: {
    field: "multiplier",
    headerName: "X",
    columnType: "number",
    width: 0.1,
    tableColumnType: "body"
  },
  rate: {
    field: "rate",
    headerName: "Rate",
    formatter: tabling.formatters.currencyValueFormatter,
    columnType: "currency",
    width: 0.1,
    tableColumnType: "body"
  },
  estimated: {
    field: "estimated",
    headerName: "Total",
    tableColumnType: "calculated",
    columnType: "sum",
    width: 0.1,
    formatter: tabling.formatters.currencyValueFormatter
  }
};
