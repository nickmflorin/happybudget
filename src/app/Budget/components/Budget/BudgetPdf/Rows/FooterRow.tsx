import { isNil } from "lodash";
import classNames from "classnames";

import BodyRow, { BodyRowProps } from "./BodyRow";

const FooterRow = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: BodyRowProps<R, M>
): JSX.Element => {
  return (
    <BodyRow<R, M>
      {...props}
      className={classNames("footer-tr", props.className)}
      columns={props.columns}
      cellProps={{
        textClassName: "footer-tr-td-text",
        valueGetter: (c: Table.PdfColumn<R, M>, rows: Table.BodyRow<R>[]) => {
          if (!isNil(c.pdfFooterValueGetter)) {
            return typeof c.pdfFooterValueGetter === "function" ? c.pdfFooterValueGetter(rows) : c.pdfFooterValueGetter;
          }
        }
      }}
    />
  );
};

export default FooterRow;
