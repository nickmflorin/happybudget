import React from "react";
import { map, isNil } from "lodash";

import { tabling } from "lib";
import MenuAction from "./MenuAction";

type PublicToolbarProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Table.PublicMenuActionParams<R, M> & {
  readonly actions: Table.PublicMenuActions<R, M>;
};

const PublicToolbar = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: PublicToolbarProps<R, M>
): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {!isNil(props.apis) &&
        map(
          tabling.menu.evaluateActions<R, M, Table.PublicMenuActionParams<R, M>>(props.actions, {
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

export default React.memo(PublicToolbar) as typeof PublicToolbar;
