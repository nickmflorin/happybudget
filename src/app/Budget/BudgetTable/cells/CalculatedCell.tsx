import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ICellRendererParams } from "ag-grid-community";
import CellRenderer from "./CellRenderer";

interface CalculatedCellProps extends ICellRendererParams {
  value: string | number | null;
  renderRedIfNegative?: boolean;
}

const CalculatedCell = <R extends Table.Row<any, any>>({
  value,
  renderRedIfNegative = false,
  ...props
}: CalculatedCellProps): JSX.Element => {
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

  return <CellRenderer<R> className={classNames({ "color--red": renderRed })} value={value} {...props} />;
};

export default CalculatedCell;
