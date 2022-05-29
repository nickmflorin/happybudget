import React from "react";
import { isNil } from "lodash";

import { Link } from "components/links";

import { Cell } from "./generic";
import useFormattedValue from "./useFormattedValue";

export type LinkCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  CL extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>
> = Table.ValueCellProps<R, M, C, S, string | null, CL> & {
  readonly href?: string | ((value: string | number | null) => string | undefined) | undefined;
  readonly target?: string | undefined;
  readonly rel?: string | undefined;
};

const LinkCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  CL extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>
>({
  value,
  href,
  target,
  rel,
  ...props
}: LinkCellProps<R, M, C, S, CL>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return (
    <Cell<R, M, C, S, string | null, CL> {...props}>
      <Link
        className={"link--table"}
        href={!isNil(href) ? (typeof href === "string" ? href : href(formattedValue)) : undefined}
        target={target}
        rel={rel}
      >
        {formattedValue}
      </Link>
    </Cell>
  );
};

export default React.memo(LinkCell) as typeof LinkCell;
