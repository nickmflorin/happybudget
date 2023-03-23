import classNames from "classnames";

import Cell, { CellProps } from "./Cell";

const HeaderCell = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  V extends Table.RawRowValue = Table.RawRowValue,
>(
  props: Omit<CellProps<R, M, V>, "rawValue" | "value">,
): JSX.Element => (
  <Cell<R, M, V>
    {...props}
    textClassName={classNames("th-text", props.textClassName)}
    isHeader={true}
    rawValue={(props.column.pdfHeaderName as V) || (props.column.headerName as V) || ("" as V)}
    value={props.column.pdfHeaderName || props.column.headerName || ""}
  />
);

export default HeaderCell;
