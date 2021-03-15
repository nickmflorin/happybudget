import { map } from "lodash";
import { Menu } from "antd";
import "./UnitsMenu.scss";

export interface IUnitMenuItem {
  value: Unit | null;
  label: UnitName | "None";
  color: string;
}

export const UNIT_MENU_ITEMS: IUnitMenuItem[] = [
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
  item: IUnitMenuItem;
}

export const UnitTag = ({ item }: UnitTagProps): JSX.Element => {
  return (
    <div className={"unit-tag"} style={{ backgroundColor: item.color }}>
      {item.label}
    </div>
  );
};

export interface UnitsMenuProps {
  onChange: (value: Unit) => void;
}

const UnitsMenu = ({ onChange }: UnitsMenuProps): JSX.Element => {
  return (
    <Menu className={"units-menu"}>
      {map(UNIT_MENU_ITEMS, (it: IUnitMenuItem, index: number) => {
        return (
          <Menu.Item
            key={index}
            className={"units-menu-item"}
            onClick={(info: any) => onChange(parseInt(info.key) as Unit)}
          >
            <UnitTag item={it} />
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default UnitsMenu;
