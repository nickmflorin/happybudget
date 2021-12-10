import React from "react";
import classNames from "classnames";
import ModelMenu from "./ModelMenu";

const TableModelMenu = <M extends Model.Model, S extends object = MenuItemSelectedState>(
  props: IMenu<S, M>
): JSX.Element => <ModelMenu<M, S> {...props} className={classNames("table-menu", props.className)} />;

export default React.memo(TableModelMenu) as typeof TableModelMenu;
