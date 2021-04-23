import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import ValueCell, { ValueCellProps } from "./ValueCell";

interface CalculatedCellProps<R extends Table.Row> extends ValueCellProps<R> {
  renderRedIfNegative?: boolean;
}

const CalculatedCell = <R extends Table.Row>({
  value,
  renderRedIfNegative = false,
  ...props
}: CalculatedCellProps<R>): JSX.Element => {
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

  return <ValueCell<R> className={classNames({ "color--red": renderRed })} value={value} {...props} />;
};

export default CalculatedCell;
