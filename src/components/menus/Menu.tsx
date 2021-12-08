import GenericMenu from "./Generic";

const Menu = (props: IMenu<MenuItemModel>): JSX.Element => <GenericMenu<MenuItemModel> {...props} />;

export default Menu;
