import { useMemo } from "react";
import classNames from "classnames";

import Cell, { CellProps } from "./Cell";

const HeaderCell = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: Omit<CellProps<R, M>, "rawValue" | "value"> & {
    readonly firstChild: boolean;
    readonly lastChild: boolean;
  }
): JSX.Element => {
  const className = useMemo(() => {
    let cs = ["th", props.className];
    if (props.firstChild) {
      cs = [...cs, "td-first-child"];
    }
    if (props.lastChild) {
      cs = [...cs, "td-last-child"];
    }
    return cs;
  }, [props.className, props.firstChild]);

  return (
    <Cell
      {...props}
      className={className}
      textClassName={classNames("th-text", props.textClassName)}
      isHeader={true}
      rawValue={(props.column.pdfHeaderName || props.column.headerName || "") as unknown as R[keyof R]}
      value={props.column.pdfHeaderName || props.column.headerName || ""}
    />
  );
};

export default HeaderCell;
