import React, { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import ClickAwayListener from "react-click-away-listener";
import { uniqueId, isNil } from "lodash";

import { Dropdown as AntdDropdown } from "antd";
import { DropDownProps as AntdDropdownProps } from "antd/lib/dropdown";

import { Menu } from "components/menus";
import { util, ui } from "lib";

interface BaseDropdownProps extends Omit<AntdDropdownProps, "overlay" | "visible"> {
  readonly onClickAway?: () => void;
  readonly children: React.ReactChild | React.ReactChild[];
}

export interface DropdownOverlayProps extends BaseDropdownProps {
  readonly overlay: React.ReactElement | (() => React.ReactElement);
}

export interface DropdownMenuItemsProps extends BaseDropdownProps {
  readonly menuProps?: StandardComponentProps;
  readonly menuItems: MenuItemModel[];
  readonly menuMode?: "single" | "multiple";
  readonly menuButtons?: IMenuButton<MenuItemModel>[];
  readonly menuCheckbox?: boolean;
  readonly menuDefaultSelected?: MenuItemId[];
  readonly menuSelected?: MenuItemId[];
  readonly includeSearch?: boolean;
  readonly searchIndices?: SearchIndicies;
  readonly clientSearching?: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly onChange?: (params: MenuChangeEvent<MenuItemModel>) => void;
}

export type DropdownProps = DropdownOverlayProps | DropdownMenuItemsProps;

export const isPropsWithOverlay = (props: DropdownProps): props is DropdownOverlayProps =>
  (props as DropdownOverlayProps).overlay !== undefined;

const Dropdown = ({ ...props }: DropdownProps): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const buttonId = useMemo(() => uniqueId("dropdown-button-"), []);
  const menuId = useMemo(() => uniqueId("dropdown-menu-"), []);
  const menuRef = ui.hooks.useMenu();

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.stopPropagation();
        setVisible(false);
      }
    };
    menuRef.current.focus(visible);
    if (visible === true) {
      window.addEventListener("keydown", keyListener);
    } else {
      window.removeEventListener("keydown", keyListener);
    }
    return () => window.removeEventListener("keydown", keyListener);
  }, [visible]);

  return (
    <AntdDropdown
      {...props}
      visible={visible}
      className={classNames("dropdown", props.className)}
      trigger={props.trigger || ["click"]}
      overlay={
        <ClickAwayListener
          onClickAway={(e: any) => {
            // react-click-away-listener does a pretty shitty job of weeding out
            // click events inside the element that it's ClickAwayListener
            // component wraps.
            // Note that this logic falls apart if a custom overlay is being
            // used.
            const menu = document.getElementById(menuId);
            if (!isNil(menu) && util.html.isNodeDescendantOf(menu, e.target)) {
              return;
            }
            // Since the dropdown button (props.children) is rendered outside
            // of the menu (where the ClickAway is detected), clicking the
            // button will also trigger the ClickAway, so we need to avoid it.
            const button = document.getElementById(buttonId);
            if (!isNil(button) && !util.html.isNodeDescendantOf(button, e.target)) {
              setVisible(false);
              props.onClickAway?.();
            }
          }}
        >
          <React.Fragment>
            {isPropsWithOverlay(props) ? (
              React.Children.only(props.overlay) && React.isValidElement(props.overlay) ? (
                React.cloneElement(props.overlay, { id: menuId })
              ) : (
                props.overlay
              )
            ) : (
              <Menu
                {...props.menuProps}
                id={menuId}
                menu={menuRef}
                keepDropdownOpenOnClick={props.keepDropdownOpenOnClick}
                models={props.menuItems}
                onChange={props.onChange}
                closeParentDropdown={() => {
                  setVisible(false);
                }}
                mode={props.menuMode}
                checkbox={props.menuCheckbox}
                buttons={props.menuButtons}
                defaultSelected={props.menuDefaultSelected}
                selected={props.menuSelected}
                includeSearch={props.includeSearch}
                clientSearching={props.clientSearching}
                searchIndices={props.searchIndices}
              />
            )}
          </React.Fragment>
        </ClickAwayListener>
      }
    >
      {React.Children.only(props.children) && React.isValidElement(props.children)
        ? React.cloneElement(props.children, { id: buttonId, onClick: () => setVisible(!visible) })
        : props.children}
    </AntdDropdown>
  );
};

export default React.memo(Dropdown);
