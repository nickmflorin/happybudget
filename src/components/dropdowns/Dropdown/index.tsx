import React, { useMemo } from "react";
import classNames from "classnames";
import ClickAwayListener from "react-click-away-listener";
import { uniqueId, isNil } from "lodash";

import { Dropdown as AntdDropdown } from "antd";
import { DropDownProps } from "antd/lib/dropdown";

import { DropdownMenu } from "components/menus";
import { IDropdownMenu, IDropdownMenuItem } from "components/menus/DropdownMenu";
import { util } from "lib";

interface BaseDropdownProps
  extends Omit<DropDownProps, "overlay" | "className">,
    StandardComponentProps,
    Omit<IDropdownMenu, "className" | "style" | "items"> {
  children: React.ReactChild | React.ReactChild[];
  menuProps?: Omit<IDropdownMenu, "onClick" | "onChange" | "items">;
  onClickAway?: () => void;
}

interface DropdownOverlayProps extends BaseDropdownProps {
  overlay: React.ReactElement | (() => React.ReactElement);
  items?: undefined;
}

interface DropdownMenuItemsProps extends BaseDropdownProps {
  items: IDropdownMenuItem[] | JSX.Element[];
  overlay?: undefined;
}

export type DropdownProps = DropdownOverlayProps | DropdownMenuItemsProps;

export const includesMenuItems = (
  obj: DropdownMenuItemsProps | DropdownOverlayProps
): obj is DropdownMenuItemsProps => {
  return (obj as DropdownMenuItemsProps).items !== undefined;
};

const Dropdown = ({ ...props }: DropdownProps): JSX.Element => {
  const buttonId = useMemo(() => uniqueId(), []);

  return (
    <AntdDropdown
      {...props}
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
            if (!isNil(props.onClickAway)) {
              const menus = document.getElementsByClassName("dropdown-menu");
              let clickInsideMenu = false;
              for (let i = 0; i < menus.length; i++) {
                if (util.html.isNodeDescendantOf(menus[i], e.target)) {
                  clickInsideMenu = true;
                  break;
                }
              }
              // Since the dropdown button (props.children) is rendered outside
              // of the menu (where the ClickAway is detected), clicking the
              // button will also trigger the ClickAway, so we need to avoid it.
              const button = document.getElementById(buttonId);
              if (!isNil(button) && !util.html.isNodeDescendantOf(button, e.target) && clickInsideMenu === false) {
                props.onClickAway();
              }
            }
          }}
        >
          <React.Fragment>
            {includesMenuItems(props) ? (
              <DropdownMenu
                {...props.menuProps}
                onClick={props.onClick}
                onChange={props.onChange}
                items={props.items}
              />
            ) : (
              props.overlay
            )}
          </React.Fragment>
        </ClickAwayListener>
      }
    >
      {React.Children.only(props.children) && React.isValidElement(props.children)
        ? React.cloneElement(props.children, { id: buttonId })
        : props.children}
    </AntdDropdown>
  );
};

Dropdown.Menu = DropdownMenu;

export default Dropdown;
