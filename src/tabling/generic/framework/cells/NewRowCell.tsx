import React from "react";

import { Icon } from "components";
import { IconButton } from "components/buttons";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
interface NewRowCellProps extends Table.CellProps<any, any, any, null> {
  readonly onNewRow: () => void;
}

const NewRowCell = (props: NewRowCellProps): JSX.Element => {
  return (
    <IconButton
      className={"btn--new-row"}
      size={"medium"}
      icon={<Icon icon={"plus-circle"} weight={"solid"} />}
      style={{ margin: "0 auto" }}
      onClick={() => props.onNewRow()}
    />
  );
};

export default React.memo(NewRowCell);
