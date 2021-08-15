import { isNil } from "lodash";

import { Link } from "components/links";

import { Cell } from "./generic";
import useFormattedValue from "./useFormattedValue";

export type LinkCellProps<R extends Table.Row, M extends Model.Model> = Table.ValueCellProps<R, M> & {
  readonly href?: string | ((value: string | number | null) => string | undefined) | undefined;
  readonly rel?: string | undefined;
};

const LinkCell = <R extends Table.Row, M extends Model.Model>({
  value,
  href,
  rel,
  ...props
}: LinkCellProps<R, M>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return (
    <Cell<R, M> {...props}>
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
