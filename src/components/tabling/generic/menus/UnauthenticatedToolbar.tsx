import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import TableMenuAction from "./MenuAction";

interface UnauthenticatedToolbarProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M, G>[];
  readonly actions: Table.UnauthenticatedMenuActions<R, M, G>;
  readonly hiddenColumns: (keyof R)[];
}

/* eslint-disable indent */
const UnauthenticatedToolbar = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  props: UnauthenticatedToolbarProps<R, M, G>
): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {!isNil(props.apis) &&
        map(
          tabling.menu.evaluateActions<R, M, G, Table.UnauthenticatedMenuActionParams<R, M, G>>(props.actions, {
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
