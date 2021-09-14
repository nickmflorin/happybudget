import { isNil } from "lodash";

import { Link } from "components/links";

import { Cell } from "./generic";
import useFormattedValue from "./useFormattedValue";

export type LinkCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> = Table.ValueCellProps<R, M, G, S> & {
  readonly href?: string | ((value: string | number | null) => string | undefined) | undefined;
  readonly rel?: string | undefined;
};

/* eslint-disable indent */
const LinkCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>({
  value,
  href,
  rel,
  ...props
}: LinkCellProps<R, M, G, S>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return (
    <Cell<R, M, G, S> {...props}>
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
