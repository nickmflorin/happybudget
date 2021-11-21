import React from "react";
import { tabling } from "lib";

import { Icon } from "components";
import { IconButton } from "components/buttons";

const NewRowCell = (props: Table.CellProps<any, any, any, null>): JSX.Element => {
  return (
    <IconButton
      className={"green"}
      size={"medium"}
      icon={<Icon icon={"plus-circle"} weight={"solid"} />}
      style={{ margin: "0 auto" }}
      onClick={() =>
        props.onChangeEvent?.({
          type: "rowAdd",
          payload: { id: tabling.managers.placeholderRowId(), data: props.generateNewRowData?.(props.data) }
        })
      }
    />
  );
};

export default React.memo(NewRowCell);
