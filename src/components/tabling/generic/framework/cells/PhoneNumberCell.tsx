import { isNil } from "lodash";

import { tabling } from "lib";
import LinkCell, { LinkCellProps } from "./LinkCell";

const PhoneNumberCell = <R extends Table.Row, M extends Model.Model>(props: LinkCellProps<R, M>): JSX.Element => {
  return (
    <LinkCell<R, M>
      href={(v: string | number | null) => (!isNil(v) ? `tel:${v}` : undefined)}
      rel={"noreferrer"}
      valueFormatter={tabling.formatters.agPhoneNumberValueFormatter}
      {...props}
    />
  );
};

export default PhoneNumberCell;
