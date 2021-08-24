import { useMemo } from "react";
import { ValueFormatterParams } from "@ag-grid-community/core";
import { isNil } from "lodash";

const useFormattedValue = <R extends Table.Row, M extends Model.Model>(props: Table.ValueCellProps<R, M>) => {
  const formatterParams = useMemo<ValueFormatterParams | null>(
    () =>
      /* eslint-disable indent */
      !isNil(props.colDef) && !isNil(props.column)
        ? {
            value: props.value,
            node: props.node,
            data: props.node.data,
            colDef: props.colDef,
            context: props.context,
            column: props.column,
            api: props.api,
            columnApi: props.columnApi
          }
        : null,
    [props]
  );
  const cellValue = useMemo((): string | number | null => {
    if (!isNil(formatterParams)) {
      if (
        !isNil(props.colDef) &&
        !isNil(props.colDef.valueFormatter) &&
        typeof props.colDef.valueFormatter === "function"
      ) {
        return props.colDef.valueFormatter(formatterParams);
      } else if (!isNil(props.valueFormatter)) {
        // The valueFormatter can also be provided explicitly to the cell.
        return props.valueFormatter(formatterParams);
      } else {
        return props.value;
      }
    }
    return props.value;
  }, [props.value, props.colDef]);
  return cellValue;
};

export default useFormattedValue;
