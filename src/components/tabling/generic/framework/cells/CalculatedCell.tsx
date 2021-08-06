import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import BodyCell from "./BodyCell";

export interface CalculatedCellProps<R extends Table.Row, M extends Model.Model> extends Table.ValueCellProps<R, M> {
  readonly renderRedIfNegative?: boolean;
}

const CalculatedCell = <R extends Table.Row, M extends Model.Model>({
  renderRedIfNegative = false,
  ...props
}: CalculatedCellProps<R, M>): JSX.Element => {
  const renderRed = useMemo(() => {
    if (renderRedIfNegative === true && !isNil(props.value)) {
      if (typeof props.value === "string") {
        const parsed = parseFloat(props.value);
        if (parsed < 0) {
          return true;
        }
        return false;
      } else if (props.value < 0) {
        return true;
      }
      return false;
    }
  }, [props.value, renderRedIfNegative]);

  return <BodyCell<R, M> className={classNames({ "color--red": renderRed })} {...props} />;
};

export default CalculatedCell;
