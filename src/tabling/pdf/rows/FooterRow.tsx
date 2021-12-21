import { isNil } from "lodash";
import classNames from "classnames";

import BodyRow, { BodyRowProps } from "./BodyRow";

const FooterRow = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  props: BodyRowProps<R, M, V>
): JSX.Element => {
  return (
    <BodyRow<R, M, V>
      {...props}
      className={classNames("footer-tr", props.className)}
      columns={props.columns}
      cellProps={{
        textClassName: "footer-tr-td-text",
        valueGetter: (c: Table.DataColumn<R, M, V>, rows: Table.BodyRow<R>[]): V => {
          if (!isNil(c.pdfFooterValueGetter)) {
            return typeof c.pdfFooterValueGetter === "function" ? c.pdfFooterValueGetter(rows) : c.pdfFooterValueGetter;
          }
          return "" as V;
        }
      }}
    />
  );
};

export default FooterRow;
