import { useMemo } from "react";

import { isNil } from "lodash";
import { ValueFormatterParams } from "ag-grid-community";

const useFormattedValue = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends string | number | null = string | number | null,
  CL extends Table.DataColumn<R, M> = Table.DataColumn<R, M>,
>(
  props: Table.ValueCellProps<R, M, C, S, V, CL>,
): V => {
  const formatterParams = useMemo<ValueFormatterParams | null>(
    () =>
      !isNil(props.colDef) && !isNil(props.column)
        ? {
            value: props.value,
            node: props.node,
            data: props.node.data,
            colDef: props.colDef,
            context: props.context,
            column: props.column,
            api: props.api,
            columnApi: props.columnApi,
          }
        : null,
    [props],
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
  return cellValue as V;
};

export default useFormattedValue;
