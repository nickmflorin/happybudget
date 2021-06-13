import { useMemo } from "react";
import { isNil, reduce } from "lodash";
import classNames from "classnames";

import { RowProps } from "./Row";
import BodyRow from "./BodyRow";

const FooterRow = <R extends Table.PdfRow<C>, M extends Model.Model, C extends Model.Model>(
  props: Omit<RowProps<R, M, C>, "row">
): JSX.Element => {
  const footerRow = useMemo((): R => {
    return reduce(
      props.columns,
      (obj: { [key: string]: any }, col: Table.PdfColumn<R, M, C>) => {
        if (!isNil(col.footer) && !isNil(col.footer.value)) {
          obj[col.field] = col.footer.value;
        } else {
          obj[col.field] = null;
        }
        return obj;
      },
      {}
    ) as R;
  }, [props.columns]);
  return (
    <BodyRow
      {...props}
      className={classNames("footer-tr", props.className)}
      columns={props.columns}
      row={footerRow}
      cellProps={{ textClassName: "footer-tr-td-text" }}
    />
  );
};

export default FooterRow;
