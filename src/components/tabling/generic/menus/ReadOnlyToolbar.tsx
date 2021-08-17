import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import TableMenuAction from "./MenuAction";

interface ReadOnlyToolbarProps<R extends Table.Row, M extends Model.Model> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly actions: Table.ReadOnlyMenuActions<R, M>;
  readonly hiddenColumns: Table.Field<R, M>[];
}

const ReadOnlyToolbar = <R extends Table.Row, M extends Model.Model>(
  props: ReadOnlyToolbarProps<R, M>
): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {!isNil(props.apis) &&
        map(
          tabling.util.evaluateActions<R, M, Table.ReadOnlyMenuActionParams<R, M>>(props.actions, {
            apis: props.apis,
            columns: props.columns,
            hiddenColumns: props.hiddenColumns
          }),
          (action: Table.MenuActionObj, index: number) =>
            !(action.isWriteOnly === true) ? (
              <TableMenuAction key={index} action={action} />
            ) : (
              <React.Fragment key={index} />
            )
        )}
    </div>
  );
};

export default React.memo(ReadOnlyToolbar) as typeof ReadOnlyToolbar;
