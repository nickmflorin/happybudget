import React, { useEffect, useMemo, useState } from "react";
import { isNil, uniqueId } from "lodash";

import { Menu } from "components/menus";
import { ui } from "lib";

import Dropdown, { DropdownProps } from "./Dropdown";

export type DropdownMenuProps<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = Omit<IMenu<S, M>, "className" | "style"> &
  Pick<StandardComponentProps, "className"> &
  Pick<DropdownProps, "children" | "dropdown" | "placement"> & {
    readonly menuClassName?: string;
    readonly menuStyle?: React.CSSProperties;
    readonly menuId?: string;
  };

const DropdownMenu = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>({
  menuClassName,
  menuStyle,
  className,
  placement,
  menuId,
  ...props
}: DropdownMenuProps<S, M>): JSX.Element => {
  const [visible, setVisible] = useState(false);

  const _menuId = useMemo(() => (!isNil(menuId) ? menuId : uniqueId("dropdown-menu-")), [menuId]);
  const menu = ui.hooks.useMenuIfNotDefined<S, M>(props.menu);

  useEffect(() => {
    if (visible === true && !isNil(menu.current)) {
      menu.current.focus(true);
    }
  }, [visible, menu.current]);

  return (
    <Dropdown
      className={className}
      overlayId={_menuId}
      placement={placement}
      visible={visible}
      setVisible={setVisible}
      destroyPopupOnHide={true}
      overlay={
        <Menu<S, M>
          {...props}
          menu={menu}
          id={_menuId}
          className={menuClassName}
          style={menuStyle}
          closeParentDropdown={() => setVisible(false)}
        />
      }
    >
      {props.children}
    </Dropdown>
  );
};

export default React.memo(DropdownMenu) as typeof DropdownMenu;
