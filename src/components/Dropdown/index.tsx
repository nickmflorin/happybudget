import { ReactNode } from "react";
import classNames from "classnames";

import { Dropdown as AntdDropdown } from "antd";
import { DropDownProps } from "antd/lib/dropdown";

import { DropdownMenu } from "components/menus";
import { IDropdownMenu, IDropdownMenuItem } from "components/menus/DropdownMenu";

interface BaseDropdownProps
  extends Omit<DropDownProps, "overlay">,
    StandardComponentProps,
    Omit<IDropdownMenu, "className" | "style" | "items"> {
  children: ReactNode;
  menuProps?: Omit<IDropdownMenu, "onClick" | "onChange" | "items">;
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
      className={classNames("dropdown", props.className)}
      {...props}
      overlay={
        includesMenuItems(props) ? (
          <DropdownMenu {...props.menuProps} onClick={props.onClick} onChange={props.onChange} items={props.items} />
        ) : (
          props.overlay
        )
      }
    >
      {props.children}
    </AntdDropdown>
  );
};

Dropdown.Menu = DropdownMenu;

export default Dropdown;
