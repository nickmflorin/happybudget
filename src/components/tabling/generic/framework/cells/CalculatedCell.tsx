import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import BodyCell from "./BodyCell";
import connectCellToStore from "./connectCellToStore";

export interface CalculatedCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> extends Table.ValueCellProps<R, M, G, S> {
  readonly renderRedIfNegative?: boolean;
}

/* eslint-disable indent */
const CalculatedCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>({
  renderRedIfNegative = false,
  ...props
}: CalculatedCellProps<R, M, G, S>): JSX.Element => {
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

  return <BodyCell<R, M, G, S> className={classNames({ "color--red": renderRed })} {...props} />;
};

export default connectCellToStore(CalculatedCell) as typeof CalculatedCell;
