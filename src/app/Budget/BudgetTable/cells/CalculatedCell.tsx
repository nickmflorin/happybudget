import { useMemo, useState, useEffect } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ICellRendererParams } from "ag-grid-community";

interface CalculatedCellProps extends ICellRendererParams {
  value: string | number | null;
  formatter?: (value: string | number) => string | number | null;
  renderRedIfNegative?: boolean;
}

const CalculatedCell = ({ value, renderRedIfNegative = false, formatter }: CalculatedCellProps): JSX.Element => {
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

  return <span className={classNames({ "color--red": renderRed })}>{cellValue}</span>;
};

export default CalculatedCell;
