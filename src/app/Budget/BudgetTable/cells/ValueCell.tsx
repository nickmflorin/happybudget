import { useState, useEffect } from "react";
import { isNil, includes } from "lodash";

import { ICellRendererParams, RowNode, ColDef } from "ag-grid-community";
import LoadableCellWrapper from "./LoadableCellWrapper";

interface ValueCellProps extends ICellRendererParams {
  value: string | number | null;
  formatter?: (value: string | number) => string | number | null;
  node: RowNode;
  colDef: ColDef;
}

const ValueCell = <R extends Table.Row<any, any>>({ value, node, colDef, formatter }: ValueCellProps): JSX.Element => {
  const [cellValue, setCellValue] = useState<string | number | null>(null);
  useEffect(() => {
    if (!isNil(value)) {
      if (!isNil(formatter)) {
        setCellValue(formatter(value));
      } else {
        setCellValue(value);
      }
    } else {
      setCellValue(value);
    }
  }, [value, formatter]);

  const row: R = node.data;
  return (
    <LoadableCellWrapper loading={includes(row.meta.fieldsLoading, colDef.field)}>{cellValue}</LoadableCellWrapper>
  );
};

export default ValueCell;
