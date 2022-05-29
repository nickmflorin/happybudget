import React from "react";

import { Icon } from "components";
import { IconButton } from "components/buttons";

interface NewRowCellProps
  extends Table.CellProps<Table.RowData, Model.RowHttpModel, Table.Context, Redux.TableStore, null> {
  readonly onNewRow: () => void;
}

const NewRowCell = (props: NewRowCellProps): JSX.Element => (
  <IconButton
    className={"btn--new-row"}
    size={"medium"}
    icon={<Icon icon={"plus-circle"} weight={"solid"} />}
    style={{ margin: "0 auto" }}
    onClick={() => props.onNewRow()}
  />
);

export default React.memo(NewRowCell);
