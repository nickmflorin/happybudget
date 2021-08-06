import { useMemo, ReactNode } from "react";
import { isNil } from "lodash";

import Cell from "./Cell";

const ValueCell = <R extends Table.Row, M extends Model.Model>({
  value,
  ...props
}: Table.ValueCellProps<R, M>): JSX.Element => {
  const cellValue = useMemo((): ReactNode => {
    if (
      !isNil(props.colDef) &&
      !isNil(props.column) &&
      !isNil(props.colDef.valueFormatter) &&
      typeof props.colDef.valueFormatter === "function"
    ) {
      return props.colDef.valueFormatter({
        value: value,
        node: props.node,
        data: props.node.data,
        colDef: props.colDef,
        context: props.context,
        column: props.column,
        api: props.api,
        columnApi: props.columnApi
      });
    } else {
      return value;
    }
  }, [value, props.colDef]);

  return <Cell<R, M> {...props}>{cellValue}</Cell>;
};

export default ValueCell;
