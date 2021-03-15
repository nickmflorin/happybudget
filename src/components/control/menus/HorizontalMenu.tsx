import { isNil, map, includes } from "lodash";
import classNames from "classnames";
import "./HorizontalMenu.scss";

export interface IHorizontalMenuItem {
  id: any;
  label: string;
  onClick?: () => void;
}

interface HorizontalMenuItemProps extends IHorizontalMenuItem {
  selected: boolean;
}

export const HorizontalMenuItem = ({ label, selected, onClick }: HorizontalMenuItemProps): JSX.Element => {
  return (
    <div
      onClick={() => !isNil(onClick) && onClick()}
      className={classNames("horizontal-menu-item", { "horizontal-menu-item-selected": selected })}
    >
      {label}
    </div>
  );
};

interface HorizontalMenuProps {
  onChange: (item: IHorizontalMenuItem) => void;
  items: IHorizontalMenuItem[];
  selected?: any | any[];
}

const HorizontalMenu = ({ items, selected, onChange }: HorizontalMenuProps): JSX.Element => {
  return (
    <div className={"horizontal-menu"}>
      {map(items, (item: IHorizontalMenuItem) => (
        <HorizontalMenuItem
          {...item}
          selected={
            !isNil(selected) ? (Array.isArray(selected) ? includes(selected, item.id) : selected === item.id) : false
          }
          onClick={() => {
            if (!isNil(onChange)) {
              onChange(item);
            }
            if (!isNil(item.onClick)) {
              item.onClick();
            }
          }}
        />
      ))}
    </div>
  );
};

export default HorizontalMenu;
