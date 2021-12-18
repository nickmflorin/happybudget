import { isNil } from "lodash";
import { tabling, budgeting } from "lib";

import { Icon } from "components";
import { columns } from "../../generic";

type R = Tables.AccountRowData;
type M = Model.Account;

const Columns: Table.Column<R, M>[] = [
  columns.IdentifierColumn<"account", R, M>({
    field: "identifier",
    headerName: "Account",
    pdfHeaderName: "Acct #",
    pdfWidth: 0.1,
    pdfCellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  }),
  columns.BodyColumn<R, M, string | null>({
    field: "description",
    headerName: "Account Description",
    pdfFlexGrow: true,
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    /* The custom cell renderer here is only needed to include the Markup icon,
       which is annoying because it is only needed for those rows and slows down
       rendering performance. */
    cellRenderer: "BodyCell",
    cellRendererParams: {
      /* For the MarkupRow, we need to remove the flex styling so we can justify
         the Icon at the right end of the cell. */
      innerCellStyle: (row: Table.BodyRow<R>) => (tabling.typeguards.isMarkupRow(row) ? { display: "block" } : {}),
      icon: (row: Table.BodyRow<R>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    },
    pdfHeaderName: "Category Description",
    pdfFooter: { value: "Grand Total" },
    pdfValueGetter: (r: Table.BodyRow<Tables.AccountRowData>) => {
      if (tabling.typeguards.isGroupRow(r)) {
        return r.groupData.name;
      }
      return r.data.description || "";
    }
  }),
  columns.EstimatedColumn<R, M>({
    colId: "estimated",
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === "" ? "0.00" : tabling.formatters.currencyValueFormatter(params),
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.estimatedValueGetter
  }),
  columns.ActualColumn<R, M>({
    field: "actual",
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === "" ? "0.00" : tabling.formatters.currencyValueFormatter(params),
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.actualValueGetter
  }),
  columns.VarianceColumn<R, M>({
    colId: "variance",
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === "" ? "0.00" : tabling.formatters.currencyValueFormatter(params),
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.varianceValueGetter
  }),
  columns.FakeColumn<R, M>({ field: "nominal_value" }),
  columns.FakeColumn<R, M>({ field: "markup_contribution" }),
  columns.FakeColumn<R, M>({ field: "accumulated_fringe_contribution" }),
  columns.FakeColumn<R, M>({ field: "accumulated_markup_contribution" })
];

export default Columns;
