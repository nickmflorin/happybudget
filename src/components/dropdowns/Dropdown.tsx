import { ReactNode } from "react";
import classNames from "classnames";

import { Dropdown as AntdDropdown } from "antd";
import { DropDownProps } from "antd/lib/dropdown";

import { DropdownMenu } from "components/menus";
import { DropdownMenuProps, DropdownMenuItem } from "components/menus/DropdownMenu";

interface BaseDropdownProps extends Omit<DropDownProps, "overlay">, StandardComponentProps {
  children: ReactNode;
  menuProps?: DropdownMenuProps;
}

interface DropdownOverlayProps extends BaseDropdownProps {
  overlay: React.ReactElement | (() => React.ReactElement);
  items?: undefined;
}

interface DropdownMenuItemsProps extends BaseDropdownProps {
  items: DropdownMenuItem[];
  overlay?: undefined;
}

export type DropdownProps = DropdownOverlayProps | DropdownMenuItemsProps;

export const includesMenuItems = (
  obj: DropdownMenuItemsProps | DropdownOverlayProps
): obj is DropdownMenuItemsProps => {
  return (obj as DropdownMenuItemsProps).items !== undefined;
};

const Dropdown: React.FC<DropdownProps> = (props): JSX.Element => {
  return (
    <AntdDropdown
      className={classNames("dropdown", props.className)}
      {...props}
      overlay={includesMenuItems(props) ? <DropdownMenu {...props.menuProps} items={props.items} /> : props.overlay}
    >
      {props.children}
    </AntdDropdown>
  );
};

export default Dropdown;
