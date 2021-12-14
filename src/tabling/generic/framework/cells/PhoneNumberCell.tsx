import React from "react";
import { isNil } from "lodash";

import { tabling } from "lib";
import LinkCell, { LinkCellProps } from "./LinkCell";

/* eslint-disable indent */
const PhoneNumberCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: LinkCellProps<R, M, S>
): JSX.Element => {
  return (
    <LinkCell<R, M, S>
      href={(v: string | number | null) => (!isNil(v) ? `tel:${v}` : undefined)}
      rel={"noreferrer"}
      valueFormatter={tabling.formatters.phoneNumberValueFormatter}
      {...props}
    />
  );
};

export default React.memo(PhoneNumberCell);
