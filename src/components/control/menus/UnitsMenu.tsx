import { map } from "lodash";
import { Menu } from "antd";
import { Tag } from "components/display";
import { UnitModelsList } from "model";
import "./UnitsMenu.scss";

export interface UnitsMenuProps {
  onChange: (value: Unit) => void;
}

const UnitsMenu = ({ onChange }: UnitsMenuProps): JSX.Element => {
  return (
    <Menu className={"units-menu"}>
      {map(UnitModelsList, (model: UnitModel) => {
        return (
          <Menu.Item
            key={model.id}
            className={"units-menu-item"}
            onClick={(info: any) => onChange(parseInt(info.key) as Unit)}
          >
            <Tag colorIndex={model.id} uppercase>
              {model.name}
            </Tag>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default UnitsMenu;
