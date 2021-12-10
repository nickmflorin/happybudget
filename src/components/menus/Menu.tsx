import GenericMenu from "./Generic";

const Menu = <S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  props: IMenu<S, M>
): JSX.Element => <GenericMenu<S, M> {...props} />;

export default Menu;
