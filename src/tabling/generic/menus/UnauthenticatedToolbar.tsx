import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import MenuAction from "./MenuAction";

type UnauthenticatedToolbarProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Table.UnauthenticatedMenuActionParams<R, M> & {
  readonly actions: Table.UnauthenticatedMenuActions<R, M>;
};

const UnauthenticatedToolbar = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
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
            !(action.isWriteOnly === true) ? <MenuAction key={index} action={action} /> : <React.Fragment key={index} />
        )}
    </div>
  );
};

export default React.memo(UnauthenticatedToolbar) as typeof UnauthenticatedToolbar;
