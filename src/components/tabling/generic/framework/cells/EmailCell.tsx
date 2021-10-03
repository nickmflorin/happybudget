import { isNil } from "lodash";
import LinkCell, { LinkCellProps } from "./LinkCell";

/* eslint-disable indent */
const EmailCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: LinkCellProps<R, M, S>
): JSX.Element => {
  return (
    <LinkCell<R, M, S>
      href={(v: string | number | null) => (!isNil(v) ? `mailto:${v}` : undefined)}
      rel={"noreferrer"}
      {...props}
    />
  );
};

export default EmailCell;
