import { tabling, budgeting } from "lib";

import { Icon } from "components";

type R = Tables.AccountRowData;
type M = Model.Account;
type PDFM = Model.PdfAccount;

const Columns: Table.LazyColumn<R, M>[] = [
  budgeting.columns.LazyIdentifierColumn<R, M, PDFM>({
    field: "identifier",
    headerName: "Account",
    pdfHeaderName: "Acct #",
    pdfWidth: 0.1,
    pdfCellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  }),
  tabling.columns.LazyBodyColumn<R, M, string | null, PDFM>({
    field: "description",
    headerName: "Account Description",
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    cellRenderer: "BodyCell",
    cellRendererParams: {
      icon: (row: Table.BodyRow<R>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    },
    pdfHeaderName: "Category Description",
    pdfWidth: 0.75,
    pdfFooter: { value: "Grand Total" },
    pdfValueGetter: (r: Table.BodyRow<Tables.AccountRowData>) => {
      if (tabling.typeguards.isGroupRow(r)) {
        return r.groupData.name;
      }
      return r.data.description || "";
    }
  }),
  budgeting.columns.LazyEstimatedColumn<R, M, PDFM>({
    colId: "estimated",
    pdfHeaderName: "Estimated",
    pdfFormatter: tabling.formatters.currencyValueFormatter,
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.estimatedValueGetter
  }),
  budgeting.columns.LazyActualColumn<R, M, PDFM>({ includeInPdf: false, field: "actual" }),
  budgeting.columns.LazyVarianceColumn<R, M, PDFM>({ includeInPdf: false, colId: "variance" }),
  tabling.columns.LazyFakeColumn<R, M, PDFM>({ field: "nominal_value" }),
  tabling.columns.LazyFakeColumn<R, M, PDFM>({ field: "markup_contribution" }),
  tabling.columns.LazyFakeColumn<R, M, PDFM>({ field: "accumulated_fringe_contribution" }),
  tabling.columns.LazyFakeColumn<R, M, PDFM>({ field: "accumulated_markup_contribution" })
];

export default Columns;
