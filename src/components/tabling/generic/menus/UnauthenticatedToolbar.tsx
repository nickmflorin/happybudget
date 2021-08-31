import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import TableMenuAction from "./MenuAction";

interface UnauthenticatedToolbarProps<R extends Table.RowData, M extends Model.Model = Model.Model> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly actions: Table.UnauthenticatedMenuActions<R, M>;
  readonly hiddenColumns: (keyof R)[];
}

const UnauthenticatedToolbar = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  props: UnauthenticatedToolbarProps<R, M>
): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {!isNil(props.apis) &&
        map(
          tabling.menu.evaluateActions<R, M, Table.UnauthenticatedMenuActionParams<R, M>>(props.actions, {
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

export default React.memo(UnauthenticatedToolbar) as typeof UnauthenticatedToolbar;
