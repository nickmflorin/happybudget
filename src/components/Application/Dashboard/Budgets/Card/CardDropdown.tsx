import React from "react";
import { map } from "lodash";
import classNames from "classnames";

import { Dropdown, Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

import { IconOrSpinner } from "components/display";
import { IconButton } from "components/control/buttons";

import "./CardDropdown.scss";

export interface ICardDropdownItem {
  text: string;
  loading?: boolean;
  onClick: () => void;
  icon?: JSX.Element;
  disabled?: boolean;
}

interface CardDropdownProps {
  items: ICardDropdownItem[];
}

const CardDropdown = ({ items }: CardDropdownProps): JSX.Element => {
  return (
    <Dropdown
      overlay={
        <Menu className={"card-dropdown-menu"}>
          {map(items, (item: ICardDropdownItem, index: number) => {
            return (
              <Menu.Item
                key={index}
                className={classNames("card-dropdown-menu-item", { disabled: item.disabled === true })}
                style={{ display: "flex" }}
                onClick={item.disabled === true ? undefined : item.onClick}
              >
                <IconOrSpinner loading={item.loading} icon={item.icon} />
                {item.text}
              </Menu.Item>
            );
          })}
        </Menu>
      }
      trigger={["click"]}
    >
      <IconButton className={"card-dropdown-ellipsis"} icon={<FontAwesomeIcon icon={faEllipsisV} />} />
    </Dropdown>
  );
};

export default CardDropdown;
