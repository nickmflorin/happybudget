import { useMemo, useState, useEffect } from "react";
import classNames from "classnames";
import { isNil, includes } from "lodash";

import { ICellRendererParams, RowNode, ColDef } from "ag-grid-community";
import LoadableCellWrapper from "./LoadableCellWrapper";

interface CalculatedCellProps extends ICellRendererParams {
  value: string | number | null;
  formatter?: (value: string | number) => string | number | null;
  renderRedIfNegative?: boolean;
  node: RowNode;
  colDef: ColDef;
}

const CalculatedCell = <R extends Table.Row<any, any>>({
  value,
  node,
  colDef,
  renderRedIfNegative = false,
  formatter
}: CalculatedCellProps): JSX.Element => {
  const [cellValue, setCellValue] = useState<string | number | null>(null);

  const renderRed = useMemo(() => {
    if (renderRedIfNegative === true && !isNil(value)) {
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (parsed < 0) {
          return true;
        }
        return false;
      } else if (value < 0) {
        return true;
      }
      return false;
    }
  }, [value, renderRedIfNegative]);

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
    <LoadableCellWrapper loading={includes(row.meta.fieldsLoading, colDef.field)}>
      <span className={classNames({ "color--red": renderRed })}>{cellValue}</span>
    </LoadableCellWrapper>
  );
};

export default CalculatedCell;
