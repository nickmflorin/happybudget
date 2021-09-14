import { isNil } from "lodash";

import { tabling } from "lib";
import LinkCell, { LinkCellProps } from "./LinkCell";

/* eslint-disable indent */
const PhoneNumberCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  props: LinkCellProps<R, M, G, S>
): JSX.Element => {
  return (
    <LinkCell<R, M, G, S>
      href={(v: string | number | null) => (!isNil(v) ? `tel:${v}` : undefined)}
      rel={"noreferrer"}
      valueFormatter={tabling.formatters.agPhoneNumberValueFormatter}
      {...props}
    />
  );
};

export default PhoneNumberCell;
