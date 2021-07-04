import React from "react";
import classNames from "classnames";
import ClickAwayListener from "react-click-away-listener";

import { Dropdown as AntdDropdown } from "antd";
import { DropDownProps } from "antd/lib/dropdown";

import { isNodeDescendantOf } from "lib/util";

import { DropdownMenu } from "components/menus";
import { IDropdownMenu, IDropdownMenuItem } from "components/menus/DropdownMenu";
import { isNil } from "lodash";

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
                if (isNodeDescendantOf(menus[i], e.target)) {
                  clickInsideMenu = true;
                  break;
                }
              }
              if (clickInsideMenu === false) {
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
      {props.children}
    </AntdDropdown>
  );
};

Dropdown.Menu = DropdownMenu;

export default Dropdown;
