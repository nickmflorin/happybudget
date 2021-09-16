import { isNil } from "lodash";

import { Link } from "components/links";

import { Cell } from "./generic";
import useFormattedValue from "./useFormattedValue";

export type LinkCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> = Table.ValueCellProps<R, M, S> & {
  readonly href?: string | ((value: string | number | null) => string | undefined) | undefined;
  readonly rel?: string | undefined;
};

/* eslint-disable indent */
const LinkCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>({
  value,
  href,
  rel,
  ...props
}: LinkCellProps<R, M, S>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return (
    <Cell<R, M, S> {...props}>
      <Link
        className={"link--table"}
        href={!isNil(href) ? (typeof href === "string" ? href : href(formattedValue)) : undefined}
        rel={rel}
      >
        {formattedValue}
      </Link>
    </Cell>
  );
};

export default LinkCell;
