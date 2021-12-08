import React from "react";
import classNames from "classnames";
import ModelMenu from "./ModelMenu";

const TableModelMenu = <M extends Model.Model>(props: IMenu<M>): JSX.Element => (
  <ModelMenu<M> {...props} className={classNames("table-menu", props.className)} />
);

export default React.memo(TableModelMenu) as typeof TableModelMenu;
