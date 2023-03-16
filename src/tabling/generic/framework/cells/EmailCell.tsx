import React from "react";

import { isNil } from "lodash";

import LinkCell, { LinkCellProps } from "./LinkCell";

const EmailCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  CL extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>,
>(
  props: LinkCellProps<R, M, C, S, CL>,
): JSX.Element => (
  <LinkCell<R, M, C, S, CL>
    href={(v: string | number | null) => (!isNil(v) ? `mailto:${v}` : undefined)}
    target="_blank"
    rel="noreferrer noopener"
    {...props}
  />
);

export default React.memo(EmailCell) as typeof EmailCell;
