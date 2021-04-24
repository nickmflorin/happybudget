import { map } from "lodash";
import classNames from "classnames";

import { Menu } from "antd";

import { IconOrSpinner, VerticalFlexCenter } from "components";

export interface DropdownMenuItem {
  text: string;
  className?: string;
  loading?: boolean;
  onClick: () => void;
  icon?: JSX.Element;
  disabled?: boolean;
}

export interface DropdownMenuProps extends StandardComponentProps {
  itemProps?: StandardComponentProps;
}

interface _DropdownMenuProps extends DropdownMenuProps {
  items: DropdownMenuItem[];
}

const DropdownMenu = ({ items, className, itemProps = {} }: _DropdownMenuProps): JSX.Element => {
  return (
    <Menu className={classNames("dropdown-menu", className)}>
      {map(items, (item: DropdownMenuItem, index: number) => {
        return (
          <Menu.Item
            key={index}
            className={classNames("dropdown-menu-item", itemProps.className, item.className, {
              disabled: item.disabled === true
            })}
            onClick={item.disabled === true ? undefined : item.onClick}
          >
            <VerticalFlexCenter>
              <IconOrSpinner size={16} loading={item.loading} icon={item.icon} />
            </VerticalFlexCenter>
            {item.text}
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default DropdownMenu;
