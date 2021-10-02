import { useMemo } from "react";
import { isNil, reduce } from "lodash";
import classNames from "classnames";

import { RowProps } from "./Row";
import BodyRow from "./BodyRow";

const FooterRow = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: Omit<RowProps<R, M>, "row">
): JSX.Element => {
  const footerRow = useMemo(() => {
    return reduce(
      props.columns,
      (obj: { [key: string]: any }, col: Table.PdfColumn<R, M>) => {
        if (!isNil(col.footer) && !isNil(col.footer.value)) {
          obj[col.field as string] = col.footer.value;
        } else {
          obj[col.field as string] = null;
        }
        return obj;
      },
      {}
    ) as R;
  }, [props.columns]);
  return (
    <BodyRow<R, M>
      {...props}
      className={classNames("footer-tr", props.className)}
      columns={props.columns}
      row={footerRow}
      cellProps={{ textClassName: "footer-tr-td-text" }}
    />
  );
};

export default FooterRow;
