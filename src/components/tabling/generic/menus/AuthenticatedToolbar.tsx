import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import TableMenuAction from "./MenuAction";

interface AuthenticatedToolbarProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M, G>[];
  readonly actions: Table.AuthenticatedMenuActions<R, M, G>;
  readonly hiddenColumns: (keyof R)[];
  readonly selectedRows: Table.DataRow<R, M>[];
}

/* eslint-disable indent */
const AuthenticatedToolbar = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  props: AuthenticatedToolbarProps<R, M, G>
): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {!isNil(props.apis) &&
        map(
          tabling.menu.evaluateActions<R, M, G, Table.AuthenticatedMenuActionParams<R, M, G>>(props.actions, {
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

export default React.memo(AuthenticatedToolbar) as typeof AuthenticatedToolbar;
