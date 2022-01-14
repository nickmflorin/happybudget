import React, { ReactNode } from "react";
import { isNil } from "lodash";

import { Cell } from "tabling/generic/framework/cells";
import { Tag } from "components/tagging";
import { EntityTooltip } from "components/tooltips";

type ActualOwnerCellProps = Table.CellProps<
  Tables.ActualRowData,
  Model.Actual,
  Tables.ActualTableStore,
  Model.SimpleAccount | Model.SimpleSubAccount | null
>;

const ActualOwnerCell = ({ value, ...props }: ActualOwnerCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      {!isNil(value) && (
        <Tag
          className={"tag--account"}
          tooltip={({ children }: { readonly children: ReactNode }) => (
            <EntityTooltip entity={value}>{children}</EntityTooltip>
          )}
          text={value.description || value.identifier}
        />
      )}
    </Cell>
  );
};

export default React.memo(ActualOwnerCell);
