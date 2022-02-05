import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import MenuAction from "./MenuAction";

type AuthenticatedToolbarProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Table.AuthenticatedMenuActionParams<R, M> & {
  readonly actions: Table.AuthenticatedMenuActions<R, M>;
};

const AuthenticatedToolbar = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: AuthenticatedToolbarProps<R, M>
): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {!isNil(props.apis) &&
        map(
          tabling.menu.evaluateActions<R, M, Table.AuthenticatedMenuActionParams<R, M>>(props.actions, {
            apis: props.apis,
            columns: props.columns,
            hiddenColumns: props.hiddenColumns,
            selectedRows: props.selectedRows
          }),
          (action: Table.MenuActionObj, index: number) => <MenuAction key={index} action={action} />
        )}
    </div>
  );
};

export default React.memo(AuthenticatedToolbar) as typeof AuthenticatedToolbar;
