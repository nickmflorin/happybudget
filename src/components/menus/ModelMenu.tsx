import React from "react";
import classNames from "classnames";
import GenericMenu from "./Generic";

const ModelMenu = <M extends Model.Model, S extends Record<string, unknown> = MenuItemSelectedState>(
  props: IMenu<S, M>
): JSX.Element => <GenericMenu<S, M> {...props} className={classNames("menu--model", props.className)} />;

export default React.memo(ModelMenu) as typeof ModelMenu;
