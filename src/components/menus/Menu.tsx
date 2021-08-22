import GenericMenu from "./Generic";

export type MenuProps = IMenu<MenuItemModel> & {
  readonly menu?: NonNullRef<IMenuRef<MenuItemModel>>;
};

const Menu = (props: MenuProps): JSX.Element => <GenericMenu<MenuItemModel> {...props} />;

export default Menu;
