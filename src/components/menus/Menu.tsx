import React from "react";
import GenericMenu from "./Generic";

const Menu = <S extends Record<string, unknown> = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  props: IMenu<S, M>
): JSX.Element => <GenericMenu<S, M> {...props} />;

export default React.memo(Menu) as typeof Menu;
