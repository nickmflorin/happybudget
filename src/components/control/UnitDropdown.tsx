import { useEffect, useState } from "react";
import { map, find, isNil } from "lodash";
import classNames from "classnames";
import { Dropdown as AntdDropdown, Menu } from "antd";
import "./UnitDropdown.scss";

interface IUnitDropdownItem {
  value: Unit | null;
  label: UnitName | "None";
  color: string;
}

const UNIT_DROPDOWN_ITEMS: IUnitDropdownItem[] = [
  {
    value: 0,
    label: "Minutes",
    color: "#d5d4e5"
  },
  {
    value: 1,
    label: "Hours",
    color: "#ffd3ba"
  },
  {
    value: 2,
    label: "Weeks",
    color: "#beebff"
  },
  {
    value: 3,
    label: "Months",
    color: "#f8c5cf"
  },
  {
    value: 4,
    label: "Days",
    color: "#feeda1"
  },
  {
    value: 5,
    label: "Nights",
    color: "#c8c4ea"
  }
];

interface UnitTagProps {
  item: IUnitDropdownItem;
}

const UnitTag = ({ item }: UnitTagProps): JSX.Element => {
  return (
    <div className={"unit-tag"} style={{ backgroundColor: item.color }}>
      {item.label}
    </div>
  );
};

interface UnitDropdownProps {
  value: Unit | null;
  className?: string;
  menuClassName?: string;
  menuItemClassName?: string;
  onChange: (value: Unit) => void;
  trigger?: ("click" | "hover" | "contextMenu")[];
}

const UnitDropdown = ({
  value,
  className,
  menuClassName,
  menuItemClassName,
  onChange,
  trigger = ["click"]
}: UnitDropdownProps): JSX.Element => {
  const [item, setItem] = useState<IUnitDropdownItem | undefined>(undefined);
  useEffect(() => {
    if (!isNil(value)) {
      const _item = find(UNIT_DROPDOWN_ITEMS, { value }) as IUnitDropdownItem;
      setItem(_item);
    } else {
      setItem({
        value: null,
        label: "None",
        color: "#a9a9a9"
      });
    }
  }, [value]);

  return (
    <AntdDropdown
      className={classNames("unit-dropdown", className)}
      trigger={trigger}
      overlay={
        <Menu className={classNames("unit-dropdown-menu", menuClassName)}>
          {map(UNIT_DROPDOWN_ITEMS, (it: IUnitDropdownItem, index: number) => {
            return (
              <Menu.Item
                key={index}
                className={classNames("unit-dropdown-menu-item", menuItemClassName)}
                onClick={(info: any) => onChange(parseInt(info.key) as Unit)}
              >
                <UnitTag item={it} />
              </Menu.Item>
            );
          })}
        </Menu>
      }
    >
      <div className={"unit-dropdown-child"}>{!isNil(item) && <UnitTag item={item} />}</div>
    </AntdDropdown>
  );
};

export default UnitDropdown;
