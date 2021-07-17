import * as formatters from "lib/model/formatters";

export const AccountColumns: { [key: string]: PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount> } = {
  identifier: {
    field: "identifier",
    headerName: "Acct #",
    columnType: "text",
    width: "10%",
    cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  },
  description: {
    field: "description",
    headerName: "Category Description",
    columnType: "longText",
    width: "75%",
    footer: {
      value: "Grand Total"
    }
  },
  estimated: {
    field: "estimated",
    headerName: "Estimated",
    isCalculated: true,
    columnType: "sum",
    formatter: formatters.currencyValueFormatter,
    width: "15%"
  }
};

export const SubAccountColumns: { [key: string]: PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount> } =
  {
    identifier: {
      field: "identifier",
      columnType: "number",
      headerName: "Acct",
      width: "10%",
      cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
    },
    description: {
      field: "description",
      headerName: "Description",
      columnType: "longText",
      width: "30%"
    },
    contact: {
      field: "contact",
      headerName: "Contact",
      columnType: "contact",
      width: "10%"
    },
    quantity: {
      field: "quantity",
      headerName: "Qty",
      columnType: "number",
      width: "10%"
    },
    unit: {
      field: "unit",
      headerName: "Unit",
      columnType: "singleSelect",
      width: "10%"
    },
    multiplier: {
      field: "multiplier",
      headerName: "X",
      columnType: "number",
      width: "10%"
    },
    rate: {
      field: "rate",
      headerName: "Rate",
      formatter: formatters.currencyValueFormatter,
      columnType: "currency",
      width: "10%"
    },
    estimated: {
      field: "estimated",
      headerName: "Total",
      isCalculated: true,
      columnType: "sum",
      width: "10%",
      formatter: formatters.currencyValueFormatter
    }
  };
