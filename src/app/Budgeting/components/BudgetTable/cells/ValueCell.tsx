import { useMemo, ReactNode } from "react";
import { isNil } from "lodash";

import Cell, { CellProps } from "./Cell";

export interface ValueCellProps<R extends Table.Row> extends CellProps<R> {
  readonly children: string | number | null;
}

const ValueCell = <R extends Table.Row>({ ...props }: ValueCellProps<R>): JSX.Element => {
  const cellValue = useMemo((): ReactNode => {
    if (
      !isNil(props.colDef) &&
      !isNil(props.column) &&
      !isNil(props.colDef.valueFormatter) &&
      typeof props.colDef.valueFormatter === "function"
    ) {
      return props.colDef.valueFormatter({
        value: props.children,
        node: props.node,
        data: props.node.data,
        colDef: props.colDef,
        context: props.context,
        column: props.column,
        api: props.api,
        columnApi: props.columnApi
      });
    } else {
      return props.children;
    }
  }, [props.children, props.colDef]);

  return <Cell<R> {...props}>{cellValue}</Cell>;
};

export default ValueCell;
