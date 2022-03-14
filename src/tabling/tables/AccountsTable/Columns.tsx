import { isNil } from "lodash";
import { tabling, budgeting } from "lib";

import { Icon } from "components";
import { columns } from "../../generic";

type R = Tables.AccountRowData;
type M = Model.Account;

const Columns: Table.Column<R, M>[] = [
  columns.IdentifierColumn<"account", R, M>({
    field: "identifier",
    markupField: "identifier",
    headerName: "Account",
    pdfHeaderName: "Acct #",
    pdfWidth: 0.1,
    pdfCellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
  }),
  columns.BodyColumn<R, M, string | null>({
    field: "description",
    markupField: "description",
    nullValue: null,
    headerName: "Account Description",
    pdfFlexGrow: true,
    minWidth: 200,
    flex: 100,
    dataType: "longText",
    /* The custom cell renderer here is only needed to include the Markup icon,
       which is annoying because it is only needed for those rows and slows down
       rendering performance. */
    cellRenderer: "BodyCell",
    cellRendererParams: {
      /* For the MarkupRow, we need to remove the flex styling so we can justify
         the Icon at the right end of the cell. */
      innerCellStyle: (row: Table.BodyRow<R>) => (tabling.rows.isMarkupRow(row) ? { display: "block" } : {}),
      icon: (row: Table.BodyRow<R>) =>
        tabling.rows.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    },
    pdfHeaderName: "Category Description",
    pdfFooter: { value: "Grand Total" },
    pdfValueGetter: (r: Table.BodyRow<Tables.AccountRowData>) => {
      if (tabling.rows.isGroupRow(r)) {
        return r.groupData.name;
      }
      return r.data.description || "";
    }
  }),
  columns.EstimatedColumn<R, M>({
    field: "estimated",
    isRead: false,
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === ""
        ? "0.00"
        : tabling.columns.currencyValueFormatter(v =>
            console.error(`Could not parse currency value ${v} for PDF field 'estimated'.`)
          )(params),
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.estimatedValueGetter
  }),
  columns.ActualColumn<R, M>({
    field: "actual",
    markupField: "actual",
    isRead: true,
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === ""
        ? "0.00"
        : tabling.columns.currencyValueFormatter(v =>
            console.error(`Could not parse currency value ${v} for PDF field 'actual'.`)
          )(params),
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.actualValueGetter,
    /* Note: This also gets triggered for the PDF model form, but that is okay
       because the PDF model form has a domain property as well. */
    isApplicableForModel: (m: Model.Account) => m.domain === "budget"
  }),
  columns.VarianceColumn<R, M>({
    field: "variance",
    isRead: false,
    pdfFormatter: (params: Table.NativeFormatterParams<string | number>) =>
      isNil(params) || params === ""
        ? "0.00"
        : tabling.columns.currencyValueFormatter(v =>
            console.error(`Could not parse currency value ${v} for PDF field 'variance'.`)
          )(params),
    pdfWidth: 0.15,
    pdfValueGetter: budgeting.valueGetters.varianceValueGetter,
    /* Note: This also gets triggered for the PDF model form, but that is okay
       because the PDF model form has a domain property as well. */
    isApplicableForModel: (m: Model.Account) => m.domain === "budget"
  }),
  columns.FakeColumn({ field: "nominal_value", nullValue: 0.0 }),
  columns.FakeColumn({ field: "markup_contribution", nullValue: 0.0 }),
  columns.FakeColumn({ field: "accumulated_fringe_contribution", nullValue: 0.0 }),
  columns.FakeColumn({ field: "accumulated_markup_contribution", nullValue: 0.0 })
];

export default Columns;
