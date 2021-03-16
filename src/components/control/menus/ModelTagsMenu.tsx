import { map } from "lodash";
import classNames from "classnames";
import { Menu } from "antd";
import { Tag } from "components/display";
import "./ModelTagsMenu.scss";

export interface ModelsTagMenuProps<I extends number, N extends string, M extends DistinctOptionModel<I, N>>
  extends StandardComponentProps {
  models: M[];
  onChange: (value: I) => void;
}

const ModelsTagMenu = <
  I extends number,
  N extends string,
  M extends DistinctOptionModel<I, N> = DistinctOptionModel<I, N>
>({
  /* eslint-disable indent */
  onChange,
  models,
  className,
  style = {}
}: ModelsTagMenuProps<I, N, M>): JSX.Element => {
  return (
    <Menu className={classNames("model-tags-menu", className)} style={style}>
      {map(models, (model: UnitModel) => {
        return (
          <Menu.Item
            key={model.id}
            className={"model-tags-menu-item"}
            onClick={(info: any) => onChange(parseInt(info.key) as I)}
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

export default ModelsTagMenu;
