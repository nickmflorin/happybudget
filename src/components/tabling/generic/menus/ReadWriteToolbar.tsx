import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import TableMenuAction from "./MenuAction";

interface ReadWriteToolbarProps<R extends Table.Row, M extends Model.Model> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly actions: Table.ReadWriteMenuActions<R, M>;
  readonly hiddenColumns: Table.Field<R, M>[];
  readonly selectedRows: R[];
}

const ReadWriteToolbar = <R extends Table.Row, M extends Model.Model>(
  props: ReadWriteToolbarProps<R, M>
): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {!isNil(props.apis) &&
        map(
          tabling.util.evaluateActions<R, M, Table.ReadWriteMenuActionParams<R, M>>(props.actions, {
            apis: props.apis,
            columns: props.columns,
            hiddenColumns: props.hiddenColumns,
            selectedRows: props.selectedRows
          }),
          (action: Table.MenuActionObj, index: number) => <TableMenuAction key={index} action={action} />
        )}
    </div>
  );
};

export default React.memo(ReadWriteToolbar) as typeof ReadWriteToolbar;
