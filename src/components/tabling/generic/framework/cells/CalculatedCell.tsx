import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import BodyCell from "./BodyCell";

export interface CalculatedCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends Table.ValueCellProps<R, M, S> {
  readonly renderRedIfNegative?: boolean;
}

/* eslint-disable indent */
const CalculatedCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>({
  renderRedIfNegative = false,
  ...props
}: CalculatedCellProps<R, M, S>): JSX.Element => {
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

  return <BodyCell<R, M, S> className={classNames({ "color--red": renderRed })} {...props} />;
};

export default CalculatedCell;
