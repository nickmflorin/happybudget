import { ReactNode } from "react";
import { map } from "lodash";
import classNames from "classnames";

import { Dropdown as AntdDropdown, Menu } from "antd";

import { IconOrSpinner } from "components/display";

export interface DropdownProps {
  children: ReactNode;
  items: IMenuItem[];
  className?: string;
  menuClassName?: string;
  menuItemClassName?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
}

const Dropdown = ({
  children,
  items,
  className,
  trigger = ["click"],
  menuClassName,
  menuItemClassName
}: DropdownProps): JSX.Element => {
  return (
    <AntdDropdown
      className={classNames("dropdown", className)}
      trigger={trigger}
      overlay={
        <Menu className={classNames("dropdown-menu", menuClassName)}>
          {map(items, (item: IMenuItem, index: number) => {
            return (
              <Menu.Item
                key={index}
                className={classNames("dropdown-menu-item", menuItemClassName, { disabled: item.disabled === true })}
                onClick={item.disabled === true ? undefined : item.onClick}
              >
                <IconOrSpinner size={20} loading={item.loading} icon={item.icon} />
                {item.text}
              </Menu.Item>
            );
          })}
        </Menu>
      }
    >
      {children}
    </AntdDropdown>
  );
};

export default Dropdown;
