import { useState, useEffect } from "react";
import { isNil } from "lodash";

import { ICellRendererParams } from "ag-grid-community";

interface ValueCellProps extends ICellRendererParams {
  value: string | number | null;
  formatter?: (value: string | number) => string | number | null;
}

const ValueCell = ({ value, formatter }: ValueCellProps): JSX.Element => {
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

  return <span>{cellValue}</span>;
};

export default ValueCell;
