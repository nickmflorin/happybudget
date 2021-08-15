import { isNil } from "lodash";
import LinkCell, { LinkCellProps } from "./LinkCell";

const EmailCell = <R extends Table.Row, M extends Model.Model>(props: LinkCellProps<R, M>): JSX.Element => {
  return (
    <LinkCell<R, M>
      href={(v: string | number | null) => (!isNil(v) ? `mailto:${v}` : undefined)}
      rel={"noreferrer"}
      {...props}
    />
  );
};

export default EmailCell;
