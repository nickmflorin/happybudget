import React from "react";

import { ui } from "lib";
import { NewRowButton } from "components/buttons";

interface NewRowCellProps
  extends Table.CellProps<
    Table.RowData,
    model.RowTypedApiModel,
    Table.Context,
    Redux.TableStore,
    null
  > {
  readonly onNewRow: () => void;
}

const NewRowCell = (props: NewRowCellProps): JSX.Element => (
  <NewRowButton
    size={ui.ButtonSizes.MEDIUM}
    onClick={() => props.onNewRow()}
    style={{ margin: "0 auto" }}
  />
);

export default React.memo(NewRowCell);
