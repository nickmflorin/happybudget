import { isNil } from "lodash";
import classNames from "classnames";

import BodyRow, { BodyRowProps } from "./BodyRow";

const FooterRow = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  props: BodyRowProps<R, M, C>
): JSX.Element => {
  return (
    <BodyRow<R, M, C>
      {...props}
      className={classNames("footer-tr", props.className)}
      columns={props.columns}
      cellProps={{
        textClassName: "footer-tr-td-text",
        valueGetter: (c: C, rows: Table.BodyRow<R>[]) => {
          if (!isNil(c.pdfFooterValueGetter)) {
            return typeof c.pdfFooterValueGetter === "function" ? c.pdfFooterValueGetter(rows) : c.pdfFooterValueGetter;
          }
        }
      }}
    />
  );
};

export default FooterRow;
