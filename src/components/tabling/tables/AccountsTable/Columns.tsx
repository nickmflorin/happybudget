import { tabling, budgeting } from "lib";

import { Icon } from "components";

type R = Tables.AccountRowData;
type M = Model.Account;
type PDFM = Model.PdfAccount;

const Columns: Table.Column<R, M>[] = [
  budgeting.columns.IdentifierColumn<R, M, PDFM>({
    field: "identifier",
    headerName: "Account",
    pdfHeaderName: "Acct #",
    pdfWidth: 0.1,
    pdfCellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  }),
  tabling.columns.BodyColumn<R, M, string | null, PDFM>({
    field: "description",
    headerName: "Account Description",
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    // The custom cell renderer here is only needed to include the Markup icon,
    // which is annoying because it is only needed for those rows and slows down
    // rendering performance.
    cellRenderer: "BodyCell",
    cellRendererParams: {
      icon: (row: Table.BodyRow<R>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    },
    pdfHeaderName: "Category Description",
    pdfWidth: 0.45,
    pdfFooter: { value: "Grand Total" },
    pdfValueGetter: (r: Table.BodyRow<Tables.AccountRowData>) => {
      if (tabling.typeguards.isGroupRow(r)) {
        return r.groupData.name;
      }
      return r.data.description || "";
    }
  }),
  budgeting.columns.EstimatedColumn<R, M, PDFM>({
    colId: "estimated",
    pdfFormatter: tabling.formatters.currencyValueFormatter,
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.estimatedValueGetter
  }),
  budgeting.columns.ActualColumn<R, M, PDFM>({
    field: "actual",
    pdfFormatter: tabling.formatters.currencyValueFormatter,
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.actualValueGetter
  }),
  budgeting.columns.VarianceColumn<R, M, PDFM>({
    colId: "variance",
    pdfFormatter: tabling.formatters.currencyValueFormatter,
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.varianceValueGetter
  }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "nominal_value" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "markup_contribution" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "accumulated_fringe_contribution" }),
  tabling.columns.FakeColumn<R, M, PDFM>({ field: "accumulated_markup_contribution" })
];

export default Columns;
