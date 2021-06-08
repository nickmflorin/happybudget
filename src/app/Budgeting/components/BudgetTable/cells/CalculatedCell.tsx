import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import BodyCell, { BodyCellProps } from "./BodyCell";

interface CalculatedCellProps<R extends Table.Row> extends BodyCellProps<R> {
  readonly renderRedIfNegative?: boolean;
  readonly children: string | number | null;
}

const CalculatedCell = <R extends Table.Row>({
  renderRedIfNegative = false,
  children,
  ...props
}: CalculatedCellProps<R>): JSX.Element => {
  const renderRed = useMemo(() => {
    if (renderRedIfNegative === true && !isNil(children)) {
      if (typeof children === "string") {
        const parsed = parseFloat(children);
        if (parsed < 0) {
          return true;
        }
        return false;
      } else if (children < 0) {
        return true;
      }
      return false;
    }
  }, [children, renderRedIfNegative]);

  return (
    <BodyCell<R> className={classNames({ "color--red": renderRed })} {...props}>
      {children}
    </BodyCell>
  );
};

export default CalculatedCell;
