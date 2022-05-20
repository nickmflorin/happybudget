import React from "react";
import { isNil } from "lodash";

import { formatters } from "lib";
import LinkCell, { LinkCellProps } from "./LinkCell";

const PhoneNumberCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>
>(
  props: LinkCellProps<R, M, S, C>
): JSX.Element => {
  return (
    <LinkCell<R, M, S, C>
      href={(v: string | number | null) => (!isNil(v) ? `tel:${v}` : undefined)}
      rel={"noreferrer"}
      valueFormatter={formatters.phoneNumberFormatter}
      {...props}
    />
  );
};

export default React.memo(PhoneNumberCell);
